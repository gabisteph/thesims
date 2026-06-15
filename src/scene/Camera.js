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
export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    50,                                      // FOV levemente maior dá a sensação de proximidade da foto
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );

  // Posição: acima (~35° de elevação), à frente, leve deslocamento lateral
  camera.position.set(6, 19, 20);

  // Olha para o centro geométrico da estrutura
  camera.lookAt(0, 5.5, 0);

  return camera;
}