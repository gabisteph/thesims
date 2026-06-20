import * as THREE from 'three';

/**
 * Câmera frontal:
 *   - Olha direto de frente para a treliça (sem deslocamento lateral)
 *   - Levemente elevada para enquadrar o topo da treliça e o balde por baixo
 *
 * Geometria de referência:
 *   Vão X: ±10 unidades
 *   Topo Y: ~8.1  (h3 × 0.5 + BASE_Y 3.0)
 *   Centro Y: ~5.5
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  // Posição frontal: x=0 (sem deslocamento lateral), z NEGATIVO para encarar
  // a face que sofre a ruptura (construída em z = -DEPTH/2 no HoweTruss.js)
  camera.position.set(0, 8, -28);

  // Olha para o centro da estrutura, enquadrando topo e balde
  camera.lookAt(0, 4.5, 0);

  return camera;
}