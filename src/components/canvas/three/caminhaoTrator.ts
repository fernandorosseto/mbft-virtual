import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ZonaId } from '@/types/conteudo';
import { materialVidro, type Carro, type Enquadramento, type MalhaVidro, type Vidro } from './carro';
import { criarMapaDanos, type ConfigMapaDanos } from './mapaDanos';

/**
 * Caminhão-trator (public/models/cavalo-mecanico.glb, ver tools/modelos/README.md), com a mesma
 * interface do sedã (`Carro`), para o palco trocar de veículo sem saber qual é.
 *
 * O arquivo vem com frente para +Z; aqui ele é girado para a frente apontar para +X, como o sedã,
 * e centrado na origem, com as rodas no chão (y = 0). Escala em metros, a mesma do sedã.
 *
 * O para-brisa e os vidros das portas estão na mesma malha (`Plane_windshield_0`): são separados
 * pela posição (o para-brisa é a peça central). No espaço local dessa malha, x atravessa a
 * cabine (+x é o lado do motorista), z sobe e a frente fica em −y.
 */
const NOME_VIDROS = 'Plane_windshield_0';
/** Triângulos com centro em |x| menor que isto pertencem ao para-brisa (local). */
const LIMITE_PARA_BRISA = 0.37;

/** Pontos de ancoragem das zonas de danos no para-brisa, em (u, v). */
const ANCORA_UV: Partial<Record<ZonaId, [number, number]>> = {
  'para-brisa-demais-areas': [0.3, 0.55],
  'para-brisa-faixa-periferica': [0.5, 0.03],
};

export function carregarCaminhaoTrator(url: string, onProgresso?: (fracao: number) => void): Promise<Carro> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(
      url,
      (gltf) => resolve(montarCaminhao(gltf.scene)),
      (e) => {
        if (onProgresso && e.lengthComputable && e.total > 0) onProgresso(e.loaded / e.total);
      },
      reject
    );
  });
}

function montarCaminhao(modelo: THREE.Group): Carro {
  const grupo = new THREE.Group();
  const orientacao = new THREE.Group();
  orientacao.rotation.y = Math.PI / 2; // frente de +Z para +X
  orientacao.add(modelo);
  grupo.add(orientacao);
  grupo.updateMatrixWorld(true);
  // Centra no chão: meio do comprimento e da largura na origem, rodas em y = 0
  const caixa0 = new THREE.Box3().setFromObject(orientacao);
  const centro0 = caixa0.getCenter(new THREE.Vector3());
  orientacao.position.set(-centro0.x, -caixa0.min.y, -centro0.z);
  grupo.updateMatrixWorld(true);

  const vidros = new Map<MalhaVidro, Vidro>();
  const materiaisCriados: THREE.Material[] = [];
  let original: THREE.Mesh | null = null;
  modelo.traverse((no) => {
    const malha = no as THREE.Mesh;
    if (!malha.isMesh) return;
    malha.castShadow = true;
    malha.receiveShadow = false;
    if (malha.name === NOME_VIDROS) original = malha;
  });

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

  let paraBrisa: THREE.Mesh | null = null;
  let mapaDanos: ReturnType<typeof criarMapaDanos> | null = null;
  const fixas = new Map<ZonaId, THREE.Vector3>();
  const laterais: THREE.Vector3[] = [];
  let enquadramentoParaBrisa: Enquadramento | null = null;

  if (original) {
    const vidroOriginal = original as THREE.Mesh;
    const geo = vidroOriginal.geometry;
    const pos = geo.getAttribute('position');
    const indice = geo.getIndex();
    if (indice) {
      const frente: number[] = [];
      const lados: number[] = [];
      for (let i = 0; i < indice.count; i += 3) {
        const a = indice.getX(i);
        const b = indice.getX(i + 1);
        const c = indice.getX(i + 2);
        const cx = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3;
        (Math.abs(cx) < LIMITE_PARA_BRISA ? frente : lados).push(a, b, c);
      }
      const criar = (indices: number[]) => {
        const g = new THREE.BufferGeometry();
        for (const [nome, attr] of Object.entries(geo.attributes)) g.setAttribute(nome, attr);
        g.setIndex(indices);
        return g;
      };
      const pai = vidroOriginal.parent ?? modelo;
      const adicionar = (chave: MalhaVidro, g: THREE.BufferGeometry) => {
        // Vidro opaco e escuro: a cabine do modelo não tem interior
        const material = materialVidro(0x233342, 0.5, 0.18, 1);
        material.transparent = false;
        const malha = new THREE.Mesh(g, material);
        malha.name = chave;
        malha.position.copy(vidroOriginal.position);
        malha.quaternion.copy(vidroOriginal.quaternion);
        malha.scale.copy(vidroOriginal.scale);
        pai.add(malha);
        registrar(chave, malha, material);
        return malha;
      };
      const geoFrente = criar(frente);
      paraBrisa = adicionar('parabrisa', geoFrente);
      adicionar('vidros-dianteiros', criar(lados));
      vidroOriginal.visible = false;
      grupo.updateMatrixWorld(true);

      // Limites do para-brisa no espaço local e plano inclinado y(z)
      let xMin = Infinity;
      let xMax = -Infinity;
      let zMin = Infinity;
      let zMax = -Infinity;
      let sz = 0;
      let sy = 0;
      let szz = 0;
      let szy = 0;
      let n = 0;
      const vistos = new Set<number>();
      for (const v of frente) {
        if (vistos.has(v)) continue;
        vistos.add(v);
        const x = pos.getX(v);
        const y = pos.getY(v);
        const z = pos.getZ(v);
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        zMin = Math.min(zMin, z);
        zMax = Math.max(zMax, z);
        sz += z;
        sy += y;
        szz += z * z;
        szy += z * y;
        n++;
      }
      const inclinacao = (n * szy - sz * sy) / (n * szz - sz * sz || 1);
      const y0 = (sy - inclinacao * sz) / n;
      const pontoLocal = (u: number, v: number) => {
        const z = zMin + v * (zMax - zMin);
        return new THREE.Vector3(xMin + u * (xMax - xMin), y0 + inclinacao * z, z);
      };
      const pb = paraBrisa as THREE.Mesh;
      const mundo = (u: number, v: number) => pb.localToWorld(pontoLocal(u, v));

      // Medidas reais do vidro (metros), para a área crítica de 40 × 50 cm
      const escala = pb.getWorldScale(new THREE.Vector3()).x;
      const larguraReal = (xMax - xMin) * escala;
      const alturaReal = Math.hypot(zMax - zMin, inclinacao * (zMax - zMin)) * escala;
      const cfg: ConfigMapaDanos = {
        tipo: 'pesado',
        uv: (x, _y, z) => [
          Math.max(0, Math.min(1, (x - xMin) / (xMax - xMin))),
          Math.max(0, Math.min(1, (z - zMin) / (zMax - zMin))),
        ],
        larguraLocal: xMax - xMin,
        larguraFaixa: 0.012,
        textura: { largura: 1536, altura: 512 },
        escalaSimbolos: 2,
        hachuraPx: 30,
        exemplos: { trinca: [0.25, 0.52], fratura: [0.46, 0.3] },
        vidroPesado: { largura: larguraReal, altura: alturaReal },
        afastamento: 0.002,
      };
      mapaDanos = criarMapaDanos(pb, cfg);

      // Âncoras: centro do vidro, zonas de danos (a crítica no meio do retângulo)
      fixas.set('para-brisa', mundo(0.5, 0.5));
      for (const [zona, [u, v]] of Object.entries(ANCORA_UV) as [ZonaId, [number, number]][]) fixas.set(zona, mundo(u, v));
      const ladoMotorista = 1 - 0.55 / larguraReal;
      const meioCritica = (0.1 + 0.25) / alturaReal;
      fixas.set('para-brisa-area-critica', mundo(Math.min(0.9, ladoMotorista), Math.min(0.9, meioCritica)));

      // Vidros das portas: centro de cada lado
      const geoLados = vidros.get('vidros-dianteiros')!.malha;
      geoLados.geometry.computeBoundingBox();
      const caixaLados = new THREE.Box3().setFromObject(geoLados);
      const centroLados = caixaLados.getCenter(new THREE.Vector3());
      laterais.push(new THREE.Vector3(centroLados.x, centroLados.y, caixaLados.max.z - 0.02));
      laterais.push(new THREE.Vector3(centroLados.x, centroLados.y, caixaLados.min.z + 0.02));

      // Enquadramento do para-brisa: à frente e um pouco ao lado, olhando o vidro
      const alvo = mundo(0.5, 0.45);
      enquadramentoParaBrisa = { alvo, posicao: alvo.clone().add(new THREE.Vector3(7.6, 1.4, 3.8)) };
    }
  }

  const caixa = new THREE.Box3().setFromObject(grupo);
  const tamanho = caixa.getSize(new THREE.Vector3());

  const ancora = (zona: ZonaId, lado: 1 | -1) => {
    const fixa = fixas.get(zona);
    if (fixa) return fixa;
    if (zona === 'laterais-dianteiros' && laterais.length === 2) return lado > 0 ? laterais[0] : laterais[1];
    return null;
  };

  const malhas: THREE.Mesh[] = [];
  grupo.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.visible && m !== mapaDanos?.malha) malhas.push(m);
  });

  const amostraSilhueta: THREE.Vector3[] = [];
  const totalVertices = malhas.reduce((n, m) => n + m.geometry.getAttribute('position').count, 0);
  const passo = Math.max(1, Math.floor(totalVertices / 400));
  for (const m of malhas) {
    const pos = m.geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i += passo) {
      amostraSilhueta.push(m.localToWorld(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i))));
    }
  }

  // Vista geral: mesma direção da câmera inicial do sedã, mais longe e mais alta (o caminhão é maior)
  const direcaoVista = new THREE.Vector3(6.2, 2.3, 5.0).normalize();
  const vista = (celular: boolean): Enquadramento => {
    const alvo = new THREE.Vector3(0, tamanho.y * 0.42, 0);
    return { alvo, posicao: alvo.clone().add(direcaoVista.clone().multiplyScalar(celular ? 17 : 12.8)) };
  };

  const enquadrar = (zona: ZonaId): Enquadramento | null => {
    if (zona === 'para-brisa' || zona.startsWith('para-brisa-')) {
      return enquadramentoParaBrisa
        ? { alvo: enquadramentoParaBrisa.alvo.clone(), posicao: enquadramentoParaBrisa.posicao.clone() }
        : null;
    }
    const ponto = ancora(zona, 1);
    return ponto ? { alvo: ponto.clone(), posicao: ponto.clone().add(new THREE.Vector3(3.5, 1.2, 5)) } : null;
  };

  return {
    grupo,
    vidros,
    paraBrisa,
    mapaDanos,
    malhas,
    amostraSilhueta,
    ancora,
    vista,
    enquadrar,
    distanciaMaxima: 22,
    // Tela estreita: o caminhão é largo e alto, a câmera recua mais que no sedã
    recuoCelular: 2,
    sombra: [tamanho.x * 1.1, tamanho.z * 1.15],
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
