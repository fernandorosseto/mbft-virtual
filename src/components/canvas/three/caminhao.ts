import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import type { ZonaId } from '@/types/conteudo';
import { PESADO } from '@/lib/paraBrisa';
import { materialVidro, type Carro, type Enquadramento, type MalhaVidro, type Vidro } from './carro';
import { criarMapaDanos, type ConfigMapaDanos } from './mapaDanos';

/**
 * Caminhão de carga com carroceria (public/models/caminhao.glb, ver tools/modelos/README.md), com
 * a mesma interface do sedã (`Carro`), para o palco trocar de veículo sem saber qual é.
 *
 * O arquivo já vem pronto (tools/modelos/preparar_caminhao.mjs): frente para +X, centrado, rodas no
 * chão, vidros divididos (`parabrisa`, `vidros-dianteiros`, `vidros-cabine`), placas Mercosul,
 * para-choque fechado e grade tampada. Vem comprimido (meshopt, decodificado pelo MeshoptDecoder),
 * com posições quantizadas: os vidros são passados para metros ao carregar (são poucos triângulos),
 * porque o mapa de danos e as âncoras usam medidas reais.
 */
/** Pontos de ancoragem das zonas de danos no para-brisa, em (u, v). */
const ANCORA_UV: Partial<Record<ZonaId, [number, number]>> = {
  'para-brisa-demais-areas': [0.28, 0.55],
  'para-brisa-faixa-periferica': [0.5, 0.03],
};

export function carregarCaminhao(url: string, onProgresso?: (fracao: number) => void): Promise<Carro> {
  return new Promise((resolve, reject) => {
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
      url,
      (gltf) => resolve(montarCaminhao(gltf.scene)),
      (e) => {
        if (onProgresso && e.lengthComputable && e.total > 0) onProgresso(e.loaded / e.total);
      },
      reject
    );
  });
}

/** Geometria em metros, no sistema do veículo (sem a quantização do arquivo). */
function emMetros(malha: THREE.Mesh) {
  const geo = malha.geometry;
  const pos = geo.getAttribute('position');
  const posicoes = new Float32Array(pos.count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(malha.matrixWorld);
    posicoes.set([v.x, v.y, v.z], i * 3);
  }
  const nova = new THREE.BufferGeometry();
  nova.setAttribute('position', new THREE.BufferAttribute(posicoes, 3));
  if (geo.index) nova.setIndex(Array.from(geo.index.array));
  nova.computeVertexNormals();
  geo.dispose();
  malha.geometry = nova;
  malha.position.set(0, 0, 0);
  malha.quaternion.identity();
  malha.scale.set(1, 1, 1);
  malha.updateMatrixWorld(true);
}

function montarCaminhao(modelo: THREE.Group): Carro {
  const grupo = new THREE.Group();
  grupo.add(modelo);
  grupo.updateMatrixWorld(true);

  const vidros = new Map<MalhaVidro, Vidro>();
  const materiaisCriados: THREE.Material[] = [];
  const registrar = (chave: MalhaVidro, malha: THREE.Mesh, material: THREE.MeshStandardMaterial) => {
    materiaisCriados.push(material);
    const borda = new THREE.LineSegments(
      new THREE.EdgesGeometry(malha.geometry, 20),
      new THREE.LineBasicMaterial({ color: 0xf2c230, transparent: true, opacity: 0.15 })
    );
    malha.add(borda);
    vidros.set(chave, { malha, material, borda });
  };

  const vidrosDoArquivo: THREE.Mesh[] = [];
  modelo.traverse((no) => {
    const malha = no as THREE.Mesh;
    if (!malha.isMesh) return;
    if (['parabrisa', 'vidros-dianteiros', 'vidros-cabine'].includes(malha.name)) vidrosDoArquivo.push(malha);
    else {
      malha.castShadow = true;
      malha.receiveShadow = false;
    }
  });
  for (const malha of vidrosDoArquivo) {
    emMetros(malha);
    // Vidro levemente transparente: a cabine tem interior (volante, bancos)
    const material = materialVidro(0x233342, 0.5, 0.18, 0.82);
    malha.material = material;
    if (malha.name === 'vidros-cabine') materiaisCriados.push(material);
    else registrar(malha.name as MalhaVidro, malha, material);
  }

  const paraBrisa: THREE.Mesh | null = vidros.get('parabrisa')?.malha ?? null;
  let mapaDanos: ReturnType<typeof criarMapaDanos> | null = null;
  const fixas = new Map<ZonaId, THREE.Vector3>();
  const laterais: THREE.Vector3[] = [];
  let enquadramentoParaBrisa: Enquadramento | null = null;

  if (paraBrisa) {
    const posicoes = paraBrisa.geometry.getAttribute('position').array as Float32Array;
    const frente = Array.from(paraBrisa.geometry.index?.array ?? []);
    // Limites do para-brisa e plano inclinado x(y)
    let zMin = Infinity;
    let zMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let sy = 0;
    let sx = 0;
    let syy = 0;
    let syx = 0;
    let m = 0;
    for (const i of new Set(frente)) {
      const x = posicoes[i * 3];
      const y = posicoes[i * 3 + 1];
      const z = posicoes[i * 3 + 2];
      zMin = Math.min(zMin, z);
      zMax = Math.max(zMax, z);
      yMin = Math.min(yMin, y);
      yMax = Math.max(yMax, y);
      sy += y;
      sx += x;
      syy += y * y;
      syx += y * x;
      m++;
    }
    const inclinacao = (m * syx - sy * sx) / (m * syy - sy * sy || 1);
    const x0 = (sx - inclinacao * sy) / m;
    const largura = zMax - zMin;
    const alturaY = yMax - yMin;
    // u = 1 no lado do motorista (−Z); v = 0 na borda de baixo
    const ponto = (u: number, w: number) => {
      const y = yMin + w * alturaY;
      return new THREE.Vector3(x0 + inclinacao * y, y, zMax - u * largura);
    };
    const larguraReal = largura;
    const alturaReal = alturaY * Math.hypot(1, inclinacao);
    const limitar01 = (t: number) => Math.max(0, Math.min(1, t));
    const cfg: ConfigMapaDanos = {
      tipo: 'pesado',
      uv: (_x, y, z) => [limitar01((zMax - z) / largura), limitar01((y - yMin) / alturaY)],
      larguraLocal: largura,
      larguraFaixa: 0.03,
      textura: { largura: 1536, altura: 768 },
      escalaSimbolos: 2,
      hachuraPx: 30,
      exemplos: { trinca: [0.25, 0.52], fratura: [0.46, 0.3] },
      vidroPesado: { largura: larguraReal, altura: alturaReal },
      afastamento: 0.004,
    };
    mapaDanos = criarMapaDanos(paraBrisa, cfg);

    fixas.set('para-brisa', ponto(0.5, 0.5));
    for (const [zona, [u, w]] of Object.entries(ANCORA_UV) as [ZonaId, [number, number]][]) fixas.set(zona, ponto(u, w));
    const eixo = 1 - PESADO.eixoVolante / larguraReal;
    const meioCritica = (PESADO.baseAreaCritica + PESADO.areaCritica.altura / 2) / alturaReal;
    fixas.set('para-brisa-area-critica', ponto(Math.min(0.92, eixo), Math.min(0.9, meioCritica)));

    // Vidros das portas: centro de cada lado (z > 0 passageiro, z < 0 motorista)
    const caixaLados = new THREE.Box3().setFromObject(vidros.get('vidros-dianteiros')!.malha);
    const centroLados = caixaLados.getCenter(new THREE.Vector3());
    laterais.push(new THREE.Vector3(centroLados.x, centroLados.y, caixaLados.max.z - 0.02));
    laterais.push(new THREE.Vector3(centroLados.x, centroLados.y, caixaLados.min.z + 0.02));

    // Enquadramento do para-brisa: à frente e um pouco ao lado, olhando o vidro
    const alvo = ponto(0.5, 0.45);
    enquadramentoParaBrisa = { alvo, posicao: alvo.clone().add(new THREE.Vector3(7.2, 1.2, 3.6)) };
  }

  // Caixa simples já é exata: os nós do arquivo só têm escala e posição (quantização), sem rotação
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
    const malha = o as THREE.Mesh;
    if (malha.isMesh && malha.visible && malha !== mapaDanos?.malha) malhas.push(malha);
  });

  const amostraSilhueta: THREE.Vector3[] = [];
  const totalVertices = malhas.reduce((t, malha) => t + malha.geometry.getAttribute('position').count, 0);
  const passo = Math.max(1, Math.floor(totalVertices / 400));
  for (const malha of malhas) {
    const pos = malha.geometry.getAttribute('position');
    for (let i = 0; i < pos.count; i += passo) {
      amostraSilhueta.push(malha.localToWorld(new THREE.Vector3().fromBufferAttribute(pos, i)));
    }
  }

  // Vista geral: de frente e de lado, com o caminhão inteiro (é bem mais comprido que o sedã) e o
  // alvo puxado para a cabine
  const direcaoVista = new THREE.Vector3(6.2, 2.4, 5.0).normalize();
  const vista = (celular: boolean): Enquadramento => {
    const alvo = new THREE.Vector3(tamanho.x * 0.12, tamanho.y * 0.4, 0);
    const distancia = tamanho.x * (celular ? 1.6 : 1.15);
    return { alvo, posicao: alvo.clone().add(direcaoVista.clone().multiplyScalar(distancia)) };
  };

  const enquadrar = (zona: ZonaId): Enquadramento | null => {
    if (zona === 'para-brisa' || zona.startsWith('para-brisa-')) {
      return enquadramentoParaBrisa
        ? { alvo: enquadramentoParaBrisa.alvo.clone(), posicao: enquadramentoParaBrisa.posicao.clone() }
        : null;
    }
    const pontoZona = ancora(zona, 1);
    return pontoZona ? { alvo: pontoZona.clone(), posicao: pontoZona.clone().add(new THREE.Vector3(3.5, 1.2, 5)) } : null;
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
    distanciaMaxima: tamanho.x * 2.2,
    recuoCelular: 2,
    sombra: [tamanho.x * 1.05, tamanho.z * 1.15],
    dispose: () => {
      mapaDanos?.dispose();
      vidros.forEach((vd) => {
        vd.borda.geometry.dispose();
        (vd.borda.material as THREE.Material).dispose();
      });
      grupo.traverse((o) => {
        const malha = o as THREE.Mesh;
        if (!malha.isMesh) return;
        malha.geometry?.dispose();
        const mats = Array.isArray(malha.material) ? malha.material : [malha.material];
        mats.forEach((mat) => mat?.dispose());
      });
      materiaisCriados.forEach((mat) => mat.dispose());
    },
  };
}

