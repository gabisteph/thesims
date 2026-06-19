import * as THREE from 'three';

/**
 * Câmera com ângulo similar à foto do protótipo físico:
 *   - Vista de cima e à frente (~35° de elevação)
 *   - Leve offset lateral para direita
 *   - Treliça ocupa boa parte do frame
 *
 * Geometria de referência:
 *   Vão X: ±10 unidades
 *   Topo Y: ~8.1  (h3 × 0.5 + BASE_Y 3.0)
 *   Centro Y: ~5.5
 */
/**
 * Câmera em ângulo diagonal baixo:
 *   - Elevação ~22° (baixa o suficiente para ver o balde por baixo da treliça)
 *   - Rotação lateral ~40° (revela a profundidade das duas faces — o "3D" da estrutura)
 *   - Olha para o centro vertical da estrutura (treliça + balde)
 */
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  // Posição diagonal: à frente, ao lado, e moderadamente elevada
  camera.position.set(15.5, 15.2, 18.5);

  // Olha para o centro da estrutura, um pouco mais baixo para enquadrar o balde
  camera.lookAt(0, 4.5, 0);

  return camera;
}