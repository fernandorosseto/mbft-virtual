import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const CAMERA_INICIAL = {
  posicao: new THREE.Vector3(6.2, 3.1, 5.0),
  alvo: new THREE.Vector3(0, 0.8, 0),
};

/** Celular em pé: tela estreita, então a câmera recua para o carro caber na largura. */
export const CAMERA_INICIAL_CELULAR = {
  posicao: new THREE.Vector3(8.4, 4.2, 6.8),
  alvo: new THREE.Vector3(0, 0.7, 0),
};

export const cameraInicial = (celular: boolean) => (celular ? CAMERA_INICIAL_CELULAR : CAMERA_INICIAL);

export interface Cena {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  /** Sol (luz com sombra): a troca de veículo esmaece a sombra dele. */
  sol: THREE.DirectionalLight;
  /** Sombra de contato (mancha sob o veículo), 5,2 × 2,6 m: acompanha o veículo e muda de escala. */
  sombraContato: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  dispose: () => void;
}

/**
 * Renderizador, câmera, luzes e chão (asfalto, faixa tracejada e sombra de contato).
 * No celular, a resolução e o mapa de sombra são reduzidos para poupar GPU e bateria.
 */
export function criarCena(canvas: HTMLCanvasElement, celular: boolean): Cena {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.copy(cameraInicial(celular).posicao);

  const controls = new OrbitControls(camera, canvas);
  controls.target.copy(cameraInicial(celular).alvo);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 3.5;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.enablePan = false;

  // Luzes (tema diurno)
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.6));

  const sol = new THREE.DirectionalLight(0xffffff, 1.8);
  sol.position.set(2.5, 10, 3.5);
  sol.castShadow = true;
  const tamanhoSombra = celular ? 1024 : 2048;
  sol.shadow.mapSize.set(tamanhoSombra, tamanhoSombra);
  // Cobre também o caminhão (11,5 m de comprimento, 3,1 m de altura)
  Object.assign(sol.shadow.camera, { left: -7.5, right: 7.5, top: 7.5, bottom: -7.5, near: 3, far: 20 });
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.015;
  sol.shadow.radius = 4;
  scene.add(sol);

  const preenchimento = new THREE.DirectionalLight(0x93c5fd, 0.9);
  preenchimento.position.set(-6, 3, -4);
  scene.add(preenchimento);

  // Asfalto: só o chão recebe sombra (a carroceria não, para evitar listras)
  const materialChao = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  const chao = new THREE.Mesh(new THREE.CircleGeometry(9, 64), materialChao);
  chao.rotation.x = -Math.PI / 2;
  chao.receiveShadow = true;
  scene.add(chao);

  // Sombra de contato (mancha radial sob o carro)
  const canvasSombra = document.createElement('canvas');
  canvasSombra.width = canvasSombra.height = 256;
  const ctx = canvasSombra.getContext('2d');
  if (ctx) {
    const grd = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    grd.addColorStop(0, 'rgba(0,0,0,0.85)');
    grd.addColorStop(0.55, 'rgba(0,0,0,0.4)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 256, 256);
  }
  const texturaSombra = new THREE.CanvasTexture(canvasSombra);
  const materialSombra = new THREE.MeshBasicMaterial({ map: texturaSombra, transparent: true, depthWrite: false });
  const mancha = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 2.6), materialSombra);
  mancha.rotation.x = -Math.PI / 2;
  mancha.position.y = 0.006;
  scene.add(mancha);

  // Faixa amarela tracejada
  const geometriaFaixa = new THREE.PlaneGeometry(0.9, 0.12);
  const materialFaixa = new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85 });
  for (let i = -4; i <= 4; i++) {
    const faixa = new THREE.Mesh(geometriaFaixa, materialFaixa);
    faixa.rotation.x = -Math.PI / 2;
    faixa.position.set(i * 1.6, 0.005, 1.9);
    scene.add(faixa);
  }

  return {
    renderer,
    scene,
    camera,
    controls,
    sol,
    sombraContato: mancha,
    dispose: () => {
      controls.dispose();
      chao.geometry.dispose();
      materialChao.dispose();
      mancha.geometry.dispose();
      materialSombra.dispose();
      texturaSombra.dispose();
      geometriaFaixa.dispose();
      materialFaixa.dispose();
      renderer.dispose();
    },
  };
}
