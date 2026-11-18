/**
 * Prepara o caminhão do site a partir do "FORD CARGO MAX TRUCK 2428e - RICK MODDING"
 * (Rick_modding, CC BY 4.0), exportado do Sketchfab em glTF.
 *
 *   node preparar_caminhao.mjs caminho/scene.gltf public/models/caminhao.glb tools/modelos/placa-mercosul.png
 *
 * Precisa de @gltf-transform/core, functions e extensions (4.1.x), meshoptimizer e three (0.169)
 * instalados numa pasta temporária; copie o script para lá e rode de lá.
 *
 * 1. Remove as inscrições da marca e do modelo ("CARGO", "MAX TRUCK", "2428e", o oval da
 *    grade) e a antena (um fio de 2,5 m que atrapalha o enquadramento).
 * 2. Separa materiais: vidros da cabine (`vidro`), carroceria de madeira (no original ela usa o
 *    material transparente dos vidros), cabine branca (no original, preta), faróis de lente clara
 *    e piscas âmbar na frente (no original, cromado que sai preto).
 * 3. Tira normais e UV (sem texturas), simplifica cada peça grande menos a cabine (~950 mil →
 *    ~250 mil triângulos), junta por material, recalcula as normais com vincos e comprime (meshopt).
 * 4. Acrescenta peças: placas Mercosul na frente e atrás (imagem de gerar_placa.mjs), painel escuro
 *    na abertura de baixo do para-choque (por ela se viam o chassi e a roda) e tampa lisa, na cor da
 *    cabine, no rebaixo oval da grade (onde ficava o emblema).
 * 5. Deixa o arquivo no sistema do site: frente para +X, centrado, rodas no chão (y = 0).
 * 6. Divide os vidros da cabine: `parabrisa` (peça da frente voltada para +X), `vidros-dianteiros`
 *    (voltados para os lados) e `vidros-cabine` (o resto).
 * Assim o site só carrega o arquivo (antes girava, centrava, dividia e montava as peças na hora).
 */
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import {
  clearNodeTransform,
  dedup,
  flatten,
  getBounds,
  join,
  meshopt,
  prune,
  simplifyPrimitive,
  transformMesh,
  weld,
} from '@gltf-transform/functions';
import { readFileSync } from 'node:fs';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
import * as THREE from 'three';
import { mergeVertices, toCreasedNormals } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const [entrada, saida, imagemPlaca] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(entrada);
const raiz = doc.getRoot();

// Malhas com a marca e a antena (nomes do arquivo original)
const removidos = [];
const REMOVER = [/^Model4\.51_/, /^Model4\.102_/, /^Volvo\.?008/];
for (const no of raiz.listNodes()) {
  if (REMOVER.some((r) => r.test(no.getName()))) {
    removidos.push(no.getName());
    no.getMesh()?.dispose();
    no.dispose();
  }
}
console.log('removidos', removidos);

const mat = (nome, cor, rugosidade, metal = 0) =>
  doc.createMaterial(nome).setBaseColorFactor(cor).setRoughnessFactor(rugosidade).setMetallicFactor(metal);
const vidro = mat('vidro', [0.14, 0.2, 0.26, 0.55], 0.15).setAlphaMode('BLEND');
const madeira = mat('carroceria', [0.42, 0.27, 0.15, 1], 0.85);
const espelho = mat('espelho', [0.55, 0.6, 0.65, 1], 0.2, 0.8);
const lente = mat('lente', [0.95, 0.75, 0.3, 1], 0.4);
// Luzes da frente: no original, as duas usam um cromado espelhado (FAROL) que sai preto sem
// reflexo do ambiente. Faróis redondos do para-choque com lente clara; lanternas retangulares
// acima da grade, âmbar (pisca)
const farol = mat('farol', [0.93, 0.95, 0.98, 1], 0.12).setEmissiveFactor([0.4, 0.42, 0.45]);
// Faixas refletivas brancas (para-choque traseiro e travessa sob a carroceria); no original usam
// o material transparente dos vidros
const refletivo = mat('refletivo', [0.95, 0.95, 0.95, 1], 0.35);
const pisca = mat('pisca', [0.98, 0.62, 0.1, 1], 0.25).setEmissiveFactor([0.55, 0.3, 0.02]);

for (const no of raiz.listNodes()) {
  const nome = no.getName();
  for (const prim of no.getMesh()?.listPrimitives() ?? []) {
    const m = prim.getMaterial();
    if (!m) continue;
    if (m.getName() === 'COR_PRINCIPAL') m.setBaseColorFactor([0.93, 0.94, 0.95, 1]).setRoughnessFactor(0.45);
    if (/^Model4\.40_/.test(nome)) prim.setMaterial(farol);
    if (/^Model4\.61_/.test(nome)) prim.setMaterial(pisca);
    if (!m.getName().startsWith('Model4.60')) continue;
    if (/^Model4\.46_/.test(nome)) prim.setMaterial(vidro);
    else if (/^Model4\.60_/.test(nome)) prim.setMaterial(espelho);
    else if (/^Model4\.(47|50|95)_/.test(nome)) prim.setMaterial(lente);
    else if (/^Model12\.(40|49)_/.test(nome)) prim.setMaterial(refletivo);
    else prim.setMaterial(madeira);
  }
  if (/^Model4\.46_/.test(nome)) no.setName('vidros');
}
// Materiais repetidos com nomes diferentes (vermelho.001, Pneu.025...) viram um só
for (const m of raiz.listMaterials()) m.setName(m.getName().replace(/\.\d+$/, ''));

// Sem normais nem UV (não há texturas): os vértices soldam e a simplificação consegue reduzir.
// As normais são recalculadas com vincos no fim.
for (const m of raiz.listMeshes())
  for (const p of m.listPrimitives())
    for (const sem of p.listSemantics()) if (sem !== 'POSITION') p.setAttribute(sem, null);

await MeshoptSimplifier.ready;
// Simplifica cada peça antes de juntar: juntas, peças vizinhas (grade, para-choque) se fundem e
// a simplificação abre buracos.
await doc.transform(weld({ tolerance: 0.0001 }));
for (const m of raiz.listMeshes())
  for (const p of m.listPrimitives()) {
    // A cabine fica inteira: simplificada, ela abre buracos na grade e nos para-lamas.
    // Peças pequenas também (a proporção as destruiria).
    if (p.getMaterial()?.getName() === 'COR_PRINCIPAL') continue;
    if ((p.getIndices()?.getCount() ?? 0) / 3 < 3000) continue;
    simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: 0.03, error: 0.006, lockBorder: false });
  }
await doc.transform(
  dedup(),
  flatten(),
  join({ keepNamed: false }),
  prune(),
  dedup()
);
for (const m of raiz.listMeshes()) {
  for (const p of m.listPrimitives()) if (p.getMaterial() === vidro) m.setName('vidros');
}
raiz.getAsset().extras = {
  title: 'Caminhão (adaptado de "FORD CARGO MAX TRUCK 2428e - RICK MODDING")',
  author: 'Rick_modding (https://sketchfab.com/Rick_modding_)',
  license: 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)',
  source: 'https://sketchfab.com/3d-models/ford-cargo-max-truck-2428e-rick-modding-e7d415be75fc4ab6b67114c611fd5ac0',
  adaptacao: 'CTB Virtual: inscrições da marca e antena removidas, cores e materiais trocados, malha simplificada',
};
// Normais com vincos (lisas abaixo de 30°), calculadas aqui para o site não gastar tempo nisso
for (const m of raiz.listMeshes())
  for (const p of m.listPrimitives()) {
    const pos = p.getAttribute('POSITION');
    const ind = p.getIndices();
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos.getArray()), 3));
    if (ind) g.setIndex(new THREE.BufferAttribute(new Uint32Array(ind.getArray()), 1));
    const r = mergeVertices(toCreasedNormals(g, Math.PI / 6), 1e-4);
    pos.setArray(new Float32Array(r.getAttribute('position').array));
    const normal = doc.createAccessor().setType('VEC3').setArray(new Float32Array(r.getAttribute('normal').array));
    p.setAttribute('NORMAL', normal);
    const novo = r.getIndex().array;
    if (ind) ind.setArray(new Uint32Array(novo));
    else p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(novo)));
  }


// ---- Peças acrescentadas (coordenadas do arquivo original: frente para −Z; medidas com raios) ----
const cena = raiz.listScenes()[0];
const buffer = raiz.listBuffers()[0];
const acessor = (tipo, arr) => doc.createAccessor().setType(tipo).setArray(arr).setBuffer(buffer);
const linear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const corHex = (hex) => [((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255].map(linear).concat(1);
function peca(nome, posicoes, normal, indices, material, uvs) {
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', acessor('VEC3', new Float32Array(posicoes)))
    .setAttribute('NORMAL', acessor('VEC3', new Float32Array(posicoes.length).map((_, i) => normal[i % 3])))
    .setIndices(acessor('SCALAR', new Uint32Array(indices)))
    .setMaterial(material);
  if (uvs) prim.setAttribute('TEXCOORD_0', acessor('VEC2', new Float32Array(uvs)));
  cena.addChild(doc.createNode(nome).setMesh(doc.createMesh(nome).addPrimitive(prim)));
}
/** Retângulo de frente para −Z (s = −1) ou +Z (s = 1); UV com a imagem de pé, vista de fora. */
function retangulo(nome, [cx, cy, cz], largura, altura, s, material, comUV) {
  const hx = (largura / 2) * -s; // à esquerda de quem olha
  const hy = altura / 2;
  const p = [cx + hx, cy + hy, cz, cx - hx, cy + hy, cz, cx + hx, cy - hy, cz, cx - hx, cy - hy, cz];
  peca(nome, p, [0, 0, s], [0, 2, 1, 1, 2, 3], material, comUV ? [0, 0, 1, 0, 0, 1, 1, 1] : null);
}
if (imagemPlaca) {
  const textura = doc.createTexture('placa-mercosul').setImage(readFileSync(imagemPlaca)).setMimeType('image/png');
  const placa = mat('placa', [1, 1, 1, 1], 0.45, 0.1).setBaseColorTexture(textura);
  retangulo('placa-dianteira', [0, 0.615, -2.634], 0.4, 0.13, -1, placa, true);
  retangulo('placa-traseira', [0, 1.385, 8.818], 0.4, 0.13, 1, placa, true);
}
const fechamento = mat('para-choque-fechamento', corHex(0x1c1f24), 0.85).setDoubleSided(true);
retangulo('para-choque-fechamento', [0, 0.4, -2.595], 0.86, 0.2, -1, fechamento, false);
{
  // Tampa elíptica (14 × 5,5 cm de raio) sobre o rebaixo oval da grade
  const cabine = raiz.listMaterials().find((m) => m.getName() === 'COR_PRINCIPAL');
  const N = 40;
  const p = [0, 1.077, -2.584];
  const ind = [];
  for (let k = 0; k < N; k++) {
    const t = (k / N) * Math.PI * 2;
    p.push(-0.14 * Math.cos(t), 1.077 + 0.055 * Math.sin(t), -2.584);
    ind.push(0, 1 + k, 1 + ((k + 1) % N));
  }
  peca('grade-tampa', p, [0, 0, -1], ind, cabine);
}

// ---- Sistema do site: transformações dos nós gravadas nos vértices, frente para +X, centrado ----
for (const no of raiz.listNodes()) if (no.getMesh()) clearNodeTransform(no);
const girar = new THREE.Matrix4().makeRotationY(-Math.PI / 2).elements;
for (const m of raiz.listMeshes()) transformMesh(m, girar);
const caixa = getBounds(cena);
const centrar = new THREE.Matrix4().makeTranslation(
  -(caixa.min[0] + caixa.max[0]) / 2,
  -caixa.min[1],
  -(caixa.min[2] + caixa.max[2]) / 2
).elements;
for (const m of raiz.listMeshes()) transformMesh(m, centrar);
console.log('caixa', getBounds(cena));

// ---- Vidros da cabine divididos pela normal ----
{
  const no = raiz.listNodes().find((n) => n.getName() === 'vidros');
  const prim = no.getMesh().listPrimitives()[0];
  const pos = prim.getAttribute('POSITION').getArray();
  const ind = prim.getIndices().getArray();
  let frenteMax = -Infinity;
  for (let i = 0; i < pos.length; i += 3) frenteMax = Math.max(frenteMax, pos[i]);
  const grupos = { parabrisa: [], 'vidros-dianteiros': [], 'vidros-cabine': [] };
  const v = (i) => [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
  for (let k = 0; k < ind.length; k += 3) {
    const [a, b, c] = [v(ind[k]), v(ind[k + 1]), v(ind[k + 2])];
    const e1 = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const e2 = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
    const n = [e2[1] * e1[2] - e2[2] * e1[1], e2[2] * e1[0] - e2[0] * e1[2], e2[0] * e1[1] - e2[1] * e1[0]];
    const len = Math.hypot(...n) || 1;
    const cx = (a[0] + b[0] + c[0]) / 3;
    const grupo =
      Math.abs(n[0] / len) > 0.6 && cx > frenteMax - 0.45
        ? 'parabrisa'
        : Math.abs(n[2] / len) > 0.6
          ? 'vidros-dianteiros'
          : 'vidros-cabine';
    grupos[grupo].push(ind[k], ind[k + 1], ind[k + 2]);
  }
  for (const [nome, lista] of Object.entries(grupos)) {
    if (!lista.length) continue;
    const nova = doc
      .createPrimitive()
      .setAttribute('POSITION', prim.getAttribute('POSITION'))
      .setAttribute('NORMAL', prim.getAttribute('NORMAL'))
      .setIndices(acessor('SCALAR', new Uint32Array(lista)))
      .setMaterial(prim.getMaterial());
    cena.addChild(doc.createNode(nome).setMesh(doc.createMesh(nome).addPrimitive(nova)));
    console.log(nome, lista.length / 3, 'triângulos');
  }
  no.getMesh().dispose();
  no.dispose();
}
await doc.transform(prune());

// Compressão (EXT_meshopt_compression): o site decodifica com o MeshoptDecoder do three
await MeshoptEncoder.ready;
await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'high' }));
io.registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write(saida, doc);
let tris = 0;
for (const m of raiz.listMeshes()) for (const p of m.listPrimitives()) tris += (p.getIndices()?.getCount() ?? 0) / 3;
console.log('triângulos', tris, 'malhas', raiz.listMeshes().length, 'materiais', raiz.listMaterials().length);
