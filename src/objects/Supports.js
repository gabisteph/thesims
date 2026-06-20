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
/**
 * Blocos de apoio posicionados nos extremos do vão da treliça, agora
 * afundados no Rio Negro — como pilares de uma ponte real, a base fica
 * submersa abaixo do nível da água (y=0) e só a parte superior aparece
 * acima da superfície, sustentando a treliça.
 *
 * TRUSS_HALF_SPAN ≈ 10 unidades  → blocos em x = ±10
 * TRUSS_BASE_Y    =  3.0          → topo dos blocos deve chegar a TRUSS_BASE_Y
 *
 * SUBMERGED_DEPTH define quanto do pilar fica afundado embaixo da água.
 */
const SUBMERGED_DEPTH = 5; // unidades de profundidade submersa abaixo de y=0

export function createSupports() {
  const group = new THREE.Group();

  const material = new THREE.MeshStandardMaterial({ color: '#D9D0C4' });

  const blockW = 6;
  const blockD = TRUSS_DEPTH + 4;           // profundidade = 5.0

  // Altura total do pilar: da base submersa até o topo que sustenta a treliça
  const blockH = TRUSS_BASE_Y + SUBMERGED_DEPTH;

  function block(x) {
    const geometry = new THREE.BoxGeometry(blockW, blockH, blockD);
    const support  = new THREE.Mesh(geometry, material);

    // Topo do bloco continua exatamente em TRUSS_BASE_Y; a base agora
    // desce até y = -SUBMERGED_DEPTH, afundando no rio
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