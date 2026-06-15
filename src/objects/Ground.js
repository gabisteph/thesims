import * as THREE from 'three';

export function createGround() {
  // Plano grande o suficiente para preencher toda a cena visível
  const geometry = new THREE.PlaneGeometry(300, 300);
  const material = new THREE.MeshStandardMaterial({
    color: '#627653',
    roughness: 0.9,
    metalness: 0.0,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x   = -Math.PI / 2;
  mesh.position.y   = 0;       // rente ao chão onde os blocos de apoio pousam
  mesh.receiveShadow = true;

  return mesh;
}