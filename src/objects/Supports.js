import * as THREE from 'three';
import { TRUSS_HALF_SPAN, TRUSS_BASE_Y, TRUSS_DEPTH } from './HoweTruss.js';

/**
 * Blocos de apoio posicionados nos extremos do vão da treliça.
 *
 * TRUSS_HALF_SPAN ≈ 10 unidades  → blocos em x = ±10
 * TRUSS_BASE_Y   =  0.5          → topo dos blocos deve chegar a y = 0.5
 *
 * Dimensões do bloco:
 *   largura (x) = 4   (cobre a profundidade do apoio)
 *   altura  (y) = TRUSS_BASE_Y × 2 → centrado em y = TRUSS_BASE_Y / 2
 *   profundidade(z) = TRUSS_DEPTH + 2  (um pouco mais fundo que a treliça)
 */
export function createSupports() {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({ color: '#D9D0C4' });

  const blockW = 4;
  const blockH = TRUSS_BASE_Y * 2;          // altura do bloco = 1.0
  const blockD = TRUSS_DEPTH + 2;           // profundidade = 3.0

  function block(x) {
    const geometry = new THREE.BoxGeometry(blockW, blockH, blockD);
    const support  = new THREE.Mesh(geometry, material);

    // Topo do bloco fica exatamente em TRUSS_BASE_Y
    support.position.set(x, TRUSS_BASE_Y - blockH / 2, 0);
    support.castShadow    = true;
    support.receiveShadow = true;
    group.add(support);
  }

  // Bloco esquerdo: x negativo, encostado na extremidade A da treliça
  block(-(TRUSS_HALF_SPAN + blockW / 2));

  // Bloco direito: x positivo, encostado na extremidade E
  block( (TRUSS_HALF_SPAN + blockW / 2));

  return group;
}