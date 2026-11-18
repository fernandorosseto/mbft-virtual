import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Malha3D, ZonaId } from '@/types/conteudo';
import { ANCORA_UV_DANOS, criarMapaDanos, pontoNoParaBrisa, type MapaDanos } from './mapaDanos';

/** Malhas de vidro do carro (o teto solar foi acrescentado ao arquivo por tools/modelos/preparar_carro.py). */
export type MalhaVidro = Malha3D;

export interface Vidro {
  malha: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  borda: THREE.LineSegments;
}

export interface Carro {
  grupo: THREE.Group;
  vidros: Map<MalhaVidro, Vidro>;
  paraBrisa: THREE.Mesh | null;
  mapaDanos: MapaDanos | null;
  /** Todas as malhas do carro, para testar se um marcador está escondido atrás da carroceria. */
  malhas: THREE.Mesh[];
  /** Amostra de pontos das malhas (coordenadas de mundo), para a silhueta do carro na tela. */
  amostraSilhueta: THREE.Vector3[];
  /** Ponto de ancoragem da zona, em coordenadas de mundo. `lado` = lado (±Z) voltado para a câmera. */
  ancora: (zona: ZonaId, lado: 1 | -1) => THREE.Vector3 | null;
  /** Vista geral própria (o caminhão é maior); sem ela, vale a câmera inicial da cena. */
  vista?: (celular: boolean) => Enquadramento;
  /** Enquadramento próprio de uma zona; sem ele, vale `ZONAS[zona].camera` (feito para o sedã). */
  enquadrar?: (zona: ZonaId) => Enquadramento | null;
  /** Distância máxima da câmera (OrbitControls). */
  distanciaMaxima: number;
  /** Quanto a câmera recua no celular ao enquadrar uma zona (padrão do palco: 1,35). */
  recuoCelular?: number;
  /** Tamanho da sombra de contato sob o veículo (comprimento × largura). */
  sombra: [number, number];
  dispose: () => void;
}

export interface Enquadramento {
  posicao: THREE.Vector3;
  alvo: THREE.Vector3;
}

export function materialVidro(cor: number, metalness: number, roughness: number, opacity: number) {
  return new THREE.MeshStandardMaterial({
    color: cor,
    metalness,
    roughness,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    emissive: new THREE.Color(0x000000),
    emissiveIntensity: 0,
  });
}

// O arquivo já vem pronto (tools/modelos/): carroceria repintada de prata (repintar_carro.py),
// vidros divididos em dianteiros, traseiros e vigia, e teto solar criado sobre a carroceria
// (preparar_carro.py). Antes isso era feito aqui, a cada carregamento.

/** Centro dos vértices usados pela geometria; com `ladoPositivo`, só os do lado +Z. */
function centro(geo: THREE.BufferGeometry, ladoPositivo = false): THREE.Vector3 {
  const pos = geo.getAttribute('position');
  const indice = geo.getIndex();
  const soma = new THREE.Vector3();
  const vistos = new Set<number>();
  if (indice) {
    for (let i = 0; i < indice.count; i++) {
      const v = indice.getX(i);
      if (vistos.has(v) || (ladoPositivo && pos.getZ(v) <= 0)) continue;
      vistos.add(v);
      soma.x += pos.getX(v);
      soma.y += pos.getY(v);
      soma.z += pos.getZ(v);
    }
  }
  return vistos.size ? soma.divideScalar(vistos.size) : soma;
}

export function carregarCarro(url: string, onProgresso: (fracao: number) => void): Promise<Carro> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => resolve(montarCarro(gltf.scene)),
      (e) => {
        if (e.lengthComputable && e.total > 0) onProgresso(e.loaded / e.total);
      },
      reject
    );
  });
}

/** Vidros do arquivo: nome do nó → zona e material (base escura; com base clara, o destaque ficava esbranquiçado). */
const VIDROS_DO_ARQUIVO: Record<string, { chave: MalhaVidro; cor: number; metal: number; rugosidade: number; opacidade: number }> = {
  parabrisa: { chave: 'parabrisa', cor: 0x233342, metal: 0.5, rugosidade: 0.18, opacidade: 0.85 },
  'vidros-dianteiros': { chave: 'vidros-dianteiros', cor: 0x233342, metal: 0.5, rugosidade: 0.18, opacidade: 0.85 },
  'vidros-traseiros': { chave: 'vidros-traseiros', cor: 0x15202b, metal: 0.6, rugosidade: 0.15, opacidade: 0.88 },
  vigia: { chave: 'vigia', cor: 0x15202b, metal: 0.6, rugosidade: 0.15, opacidade: 0.88 },
  teto: { chave: 'teto', cor: 0x15202b, metal: 0.6, rugosidade: 0.15, opacidade: 0.9 },
};

function montarCarro(modelo: THREE.Group): Carro {
  const grupo = new THREE.Group();
  const vidros = new Map<MalhaVidro, Vidro>();
  const materiaisCriados: THREE.Material[] = [];

  const registrar = (chave: MalhaVidro, malha: THREE.Mesh, material: THREE.MeshStandardMaterial) => {
    malha.material = material;
    materiaisCriados.push(material);
    const borda = new THREE.LineSegments(
      new THREE.EdgesGeometry(malha.geometry, 20),
      new THREE.LineBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.15 })
    );
    malha.add(borda);
    vidros.set(chave, { malha, material, borda });
  };

  modelo.traverse((no) => {
    const malha = no as THREE.Mesh;
    if (!malha.isMesh) return;
    malha.castShadow = true;
    malha.receiveShadow = false;
    const vidro = VIDROS_DO_ARQUIVO[malha.name];
    if (vidro) registrar(vidro.chave, malha, materialVidro(vidro.cor, vidro.metal, vidro.rugosidade, vidro.opacidade));
  });
  // O teto solar fica rente à pintura: sem sombra própria (manchas na carroceria)
  const teto = vidros.get('teto')?.malha ?? null;
  if (teto) teto.castShadow = false;
  const paraBrisa = vidros.get('parabrisa')?.malha ?? null;

  grupo.add(modelo);
  modelo.updateMatrixWorld(true);

  const mapaDanos = paraBrisa ? criarMapaDanos(paraBrisa) : null;

  // ---- Âncoras (calculadas uma vez, em coordenadas de mundo) ----
  const mundo = (v: THREE.Vector3, ref: THREE.Object3D | null) => (ref ? ref.localToWorld(v.clone()) : v.clone());
  const fixas = new Map<ZonaId, THREE.Vector3>();
  const laterais = new Map<ZonaId, THREE.Vector3>(); // lado +Z; espelhada para o lado -Z

  if (paraBrisa) {
    const pb = paraBrisa as THREE.Mesh;
    pb.geometry.computeBoundingBox();
    const c = new THREE.Vector3();
    pb.geometry.boundingBox!.getCenter(c);
    fixas.set('para-brisa', mundo(c, pb));
    for (const [zona, uv] of Object.entries(ANCORA_UV_DANOS) as [ZonaId, [number, number]][]) {
      const p = pontoNoParaBrisa(pb, uv[0], uv[1]);
      if (p) fixas.set(zona, p);
    }
  }
  const vidroDe = (chave: MalhaVidro) => vidros.get(chave)?.malha ?? null;
  const dianteiros = vidroDe('vidros-dianteiros');
  const traseiros = vidroDe('vidros-traseiros');
  const vigia = vidroDe('vigia');
  if (dianteiros) laterais.set('laterais-dianteiros', mundo(centro(dianteiros.geometry, true), dianteiros));
  if (traseiros) laterais.set('laterais-traseiros', mundo(centro(traseiros.geometry, true), traseiros));
  if (vigia) fixas.set('vigia', mundo(centro(vigia.geometry), vigia));
  // Ponto do marcador do teto: meio do painel, gravado no arquivo (extras.ancora)
  const ancoraTeto = teto?.userData.ancora as [number, number, number] | undefined;
  if (teto && ancoraTeto) fixas.set('teto', mundo(new THREE.Vector3(...ancoraTeto), teto));

  const ancora = (zona: ZonaId, lado: 1 | -1) => {
    const fixa = fixas.get(zona);
    if (fixa) return fixa;
    const lateral = laterais.get(zona);
    if (!lateral) return null;
    return new THREE.Vector3(lateral.x, lateral.y, lateral.z * lado);
  };

  const malhas: THREE.Mesh[] = [];
  grupo.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.visible && m !== mapaDanos?.malha) malhas.push(m);
  });

  // ~400 vértices espalhados pelas malhas, suficientes para o contorno do carro na tela
  const amostraSilhueta: THREE.Vector3[] = [];
  const totalVertices = malhas.reduce((n, m) => n + m.geometry.getAttribute('position').count, 0);
  const passo = Math.max(1, Math.floor(totalVertices / 400));
  for (const m of malhas) {
    const pos = m.geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i += passo) {
      amostraSilhueta.push(m.localToWorld(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))));
    }
  }

  return {
    grupo,
    vidros,
    amostraSilhueta,
    paraBrisa,
    mapaDanos,
    malhas,
    ancora,
    distanciaMaxima: 14,
    sombra: [5.2, 2.6],
    dispose: () => {
      mapaDanos?.dispose();
      vidros.forEach((v) => {
        v.borda.geometry.dispose();
        (v.borda.material as THREE.Material).dispose();
      });
      grupo.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((mat) => mat?.dispose());
      });
      materiaisCriados.forEach((m) => m.dispose());
    },
  };
}
