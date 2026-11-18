import * as THREE from 'three';
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from 'three-mesh-bvh';

/**
 * Raios rápidos (BVH, three-mesh-bvh) para o teste de oclusão dos marcadores: no caminhão
 * (~250 mil triângulos), 3 raios sem BVH custam ~50 ms por teste no desktop (bem mais no
 * celular) e travavam a página a cada 8 quadros; com BVH, menos de 1 ms.
 * Malhas sem árvore continuam usando o raio normal do three.
 */
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

type Ocioso = (cb: () => void) => number;
const quandoOcioso: Ocioso =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? (cb) => window.requestIdleCallback(cb, { timeout: 500 })
    : (cb) => window.setTimeout(cb, 16);

/**
 * Monta as árvores das malhas uma por vez, nos intervalos ociosos do navegador (montar todas de
 * uma vez travaria a página por centenas de milissegundos no celular).
 * `pronta()` diz se todas já têm árvore; até lá, quem testa oclusão deve pular o teste.
 */
export function prepararRaios(malhas: THREE.Mesh[]): { pronta: () => boolean; cancelar: () => void } {
  const fila = [...malhas].filter((m) => !m.geometry.boundsTree);
  let cancelado = false;
  const proxima = () => {
    if (cancelado) return;
    const malha = fila.shift();
    if (!malha) return;
    malha.geometry.computeBoundsTree();
    quandoOcioso(proxima);
  };
  quandoOcioso(proxima);
  return {
    pronta: () => fila.length === 0,
    cancelar: () => {
      cancelado = true;
    },
  };
}
