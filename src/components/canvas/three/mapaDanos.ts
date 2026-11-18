import * as THREE from 'three';
import type { ZonaId } from '@/types/conteudo';
import { EXEMPLOS_DANOS, areaCriticaPesado, naAreaCriticaAutomovel } from '@/lib/paraBrisa';
import { pintarMapaDanos, type TipoVeiculo } from '@/lib/pintarMapaDanos';

/**
 * Mapa de danos do para-brisa (Res. CONTRAN 960/2022, arts. 14 a 16): textura sobreposta ao vidro
 * e classificação de um ponto tocado em área crítica, faixa periférica ou demais áreas.
 * A área crítica é a metade esquerda da região varrida pelas palhetas (art. 16), com a geometria
 * de lib/paraBrisa.ts, a mesma do diagrama 2D.
 * A faixa periférica segue o contorno real da malha (não é um retângulo em UV), então
 * o desenho e a classificação do toque coincidem.
 *
 * Mapeamento UV planar pelos limites do para-brisa no modelo:
 *   Z de -0,71 (lado do motorista, esquerda) a +0,71 (passageiro); X de 0,16 a 1,01.
 *   U = (0,71 - z) / 1,42  → U > 0,5 é o lado do motorista.
 *   V = (1,01 - x) / 0,85
 */
const Z_MAX = 0.71;
const LARGURA_Z = 1.42;
const X_MAX = 1.01;
const ALTURA_X = 0.85;

const limitar01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Como o mapa de danos se aplica ao para-brisa de cada veículo: UV planar, tamanho da faixa
 * periférica, textura e regra da área crítica.
 */
export interface ConfigMapaDanos {
  tipo: TipoVeiculo;
  /** Ponto local da malha → (u, v); u = 1 é o lado do motorista. */
  uv: (x: number, y: number, z: number) => [number, number];
  /** Largura do vidro em unidades locais (para levar a faixa à escala da textura). */
  larguraLocal: number;
  /**
   * Largura da faixa periférica, em unidades locais. É maior que 2,5 cm em escala real, para
   * ser visível e tocável na tela.
   */
  larguraFaixa: number;
  textura: { largura: number; altura: number };
  escalaSimbolos: number;
  hachuraPx: number;
  exemplos: { trinca: [number, number]; fratura: [number, number] };
  /** Pesados: medidas reais do vidro em metros (área crítica de 40 × 50 cm). */
  vidroPesado?: { largura: number; altura: number };
  /** Afastamento da camada em relação ao vidro, na normal (evita z-fighting). */
  afastamento: number;
}

/**
 * Sedã. Mapeamento UV planar pelos limites do para-brisa no modelo:
 *   Z de -0,71 (lado do motorista, esquerda) a +0,71 (passageiro); X de 0,16 a 1,01.
 *   U = (0,71 - z) / 1,42  → U > 0,5 é o lado do motorista.  V = (1,01 - x) / 0,85
 */
export const CONFIG_SEDA: ConfigMapaDanos = {
  tipo: 'automovel',
  uv: (x, _y, z) => [limitar01((Z_MAX - z) / LARGURA_Z), limitar01((X_MAX - x) / ALTURA_X)],
  larguraLocal: LARGURA_Z,
  larguraFaixa: 0.03,
  textura: { largura: 1024, altura: 512 },
  escalaSimbolos: 2.3,
  hachuraPx: 30,
  exemplos: EXEMPLOS_DANOS,
  afastamento: 0.0035,
};

type Segmento = [THREE.Vector3, THREE.Vector3];

/** Arestas de contorno da malha (usadas por um único triângulo), em coordenadas locais. */
function contorno(geo: THREE.BufferGeometry): Segmento[] {
  const pos = geo.getAttribute('position');
  const indice = geo.getIndex();
  if (!indice) return [];
  // Vértices na mesma posição podem ter índices diferentes (costuras de UV): agrupa por posição.
  const chaveVertice = (i: number) => `${pos.getX(i).toFixed(4)},${pos.getY(i).toFixed(4)},${pos.getZ(i).toFixed(4)}`;
  const arestas = new Map<string, { n: number; a: number; b: number }>();
  for (let t = 0; t < indice.count; t += 3) {
    const tri = [indice.getX(t), indice.getX(t + 1), indice.getX(t + 2)];
    for (let k = 0; k < 3; k++) {
      const a = tri[k];
      const b = tri[(k + 1) % 3];
      const ka = chaveVertice(a);
      const kb = chaveVertice(b);
      const chave = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      const atual = arestas.get(chave);
      if (atual) atual.n++;
      else arestas.set(chave, { n: 1, a, b });
    }
  }
  const segs: Segmento[] = [];
  arestas.forEach(({ n, a, b }) => {
    if (n !== 1) return;
    segs.push([
      new THREE.Vector3(pos.getX(a), pos.getY(a), pos.getZ(a)),
      new THREE.Vector3(pos.getX(b), pos.getY(b), pos.getZ(b)),
    ]);
  });
  return segs;
}

const tmpLinha = new THREE.Line3();
const tmpPonto = new THREE.Vector3();
function distanciaAoContorno(ponto: THREE.Vector3, segs: Segmento[]): number {
  let min = Infinity;
  for (const [a, b] of segs) {
    tmpLinha.set(a, b).closestPointToPoint(ponto, true, tmpPonto);
    min = Math.min(min, tmpPonto.distanceTo(ponto));
  }
  return min;
}

/** Ponto representativo de cada zona de danos no sedã, em (u, v), usado para ancorar os marcadores. */
export const ANCORA_UV_DANOS: Partial<Record<ZonaId, [number, number]>> = {
  'para-brisa-area-critica': [0.74, 0.5],
  'para-brisa-demais-areas': [0.3, 0.55],
  // Centro da borda inferior (a malha não é retangular: no alto, ela termina em v ≈ 0,95)
  'para-brisa-faixa-periferica': [0.5, 0.02],
};

/** Encontra o ponto na superfície do para-brisa correspondente a (u, v), em coordenadas de mundo. */
export function pontoNoParaBrisa(malha: THREE.Mesh, u: number, v: number): THREE.Vector3 | null {
  const local = new THREE.Vector3(X_MAX - v * ALTURA_X, 5, Z_MAX - u * LARGURA_Z);
  const origem = malha.localToWorld(local.clone());
  const ray = new THREE.Raycaster(origem, new THREE.Vector3(0, -1, 0));
  const hit = ray.intersectObject(malha, false)[0];
  return hit ? hit.point.clone() : null;
}

// Textura do mapa de danos: o mesmo pintor do diagrama 2D (lib/pintarMapaDanos.ts).
// x = u · largura; y = (1 − v) · altura (flipY da textura).
function criarTexturaDanos(contornoUV: [number, number, number, number][], cfg: ConfigMapaDanos): THREE.CanvasTexture {
  const { largura: W, altura: H } = cfg.textura;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Borda real da malha (segmentos do contorno), traçada como faixa periférica
  const borda = new Path2D();
  for (const [u1, v1, u2, v2] of contornoUV) {
    borda.moveTo(u1 * W, (1 - v1) * H);
    borda.lineTo(u2 * W, (1 - v2) * H);
  }
  pintarMapaDanos(
    ctx,
    {
      largura: W,
      altura: H,
      emPx: ([u, v]) => [u * W, (1 - v) * H],
      borda,
      faixaPx: (cfg.larguraFaixa / cfg.larguraLocal) * W,
      escalaSimbolos: cfg.escalaSimbolos,
      hachuraPx: cfg.hachuraPx,
      vidroPesado: cfg.vidroPesado,
    },
    cfg.tipo,
    cfg.exemplos
  );

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export interface MapaDanos {
  malha: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  /** Zona de danos de um ponto, em coordenadas locais da malha do para-brisa. */
  classificar: (local: THREE.Vector3) => ZonaId;
  dispose: () => void;
}

/** Cria a camada com o mapa de danos sobre a malha do para-brisa (invisível até ser ativada). */
export function criarMapaDanos(paraBrisa: THREE.Mesh, cfg: ConfigMapaDanos = CONFIG_SEDA): MapaDanos {
  const borda = contorno(paraBrisa.geometry);
  const contornoUV = borda.map(
    ([a, b]) => [...cfg.uv(a.x, a.y, a.z), ...cfg.uv(b.x, b.y, b.z)] as [number, number, number, number]
  );
  const geo = paraBrisa.geometry.clone();
  const pos = geo.getAttribute('position');
  const normal = geo.getAttribute('normal');
  const uvs = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const [u, v] = cfg.uv(pos.getX(i), pos.getY(i), pos.getZ(i));
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = v;
    // Desloca levemente na normal para evitar z-fighting com o vidro
    if (normal) {
      pos.setXYZ(
        i,
        pos.getX(i) + normal.getX(i) * cfg.afastamento,
        pos.getY(i) + normal.getY(i) * cfg.afastamento,
        pos.getZ(i) + normal.getZ(i) * cfg.afastamento
      );
    }
  }
  pos.needsUpdate = true;
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

  const textura = criarTexturaDanos(contornoUV, cfg);
  const material = new THREE.MeshBasicMaterial({
    map: textura,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const malha = new THREE.Mesh(geo, material);
  malha.renderOrder = 2;
  malha.visible = false;
  paraBrisa.add(malha);

  // Mesma regra do desenho: faixa periférica; senão, área crítica do veículo; senão, demais áreas
  const critica = cfg.tipo === 'pesado' ? areaCriticaPesado(cfg.vidroPesado) : null;
  const classificar = (local: THREE.Vector3): ZonaId => {
    if (distanciaAoContorno(local, borda) < cfg.larguraFaixa) return 'para-brisa-faixa-periferica';
    const [u, v] = cfg.uv(local.x, local.y, local.z);
    const naCritica = critica
      ? u >= critica.u0 && u <= critica.u1 && v >= critica.v0 && v <= critica.v1
      : naAreaCriticaAutomovel(u, v);
    return naCritica ? 'para-brisa-area-critica' : 'para-brisa-demais-areas';
  };

  return {
    malha,
    material,
    classificar,
    dispose: () => {
      geo.dispose();
      material.dispose();
      textura.dispose();
    },
  };
}
