import * as THREE from 'three';

/**
 * Nuvens posicionadas para a câmera em position(6, 19, 20) lookAt(0, 5.5, 0).
 *
 * A câmera aponta na direção (-6, -13.5, -20), ou seja o "fundo" da cena
 * está em z negativo e y baixo. Para as nuvens aparecerem no céu atrás
 * da treliça, elas precisam estar:
 *   - z entre -60 e -10  (fundo visual)
 *   - y entre 18 e 30    (acima da linha do horizonte da câmera)
 *   - x espalhado em ±50
 */
export function createClouds() {
  const clouds = new THREE.Group();

  const positions = [
    [ -35, 26, -50],
    [  10, 22, -40],
    [ -10, 28, -55],
    [  40, 24, -45],
    [ -50, 20, -35],
    [  25, 30, -60],
    [ -20, 25, -30],
    [  50, 22, -50],
  ];

  positions.forEach(([x, y, z]) => {
    const cloud = createCloud();
    // Variação aleatória pequena para não ficarem idênticas
    cloud.position.set(
      x + (Math.random() - 0.5) * 6,
      y + (Math.random() - 0.5) * 3,
      z + (Math.random() - 0.5) * 6
    );
    // Rotação aleatória no eixo Y para variar o perfil
    cloud.rotation.y = Math.random() * Math.PI;
    clouds.add(cloud);
  });

  return clouds;
}

function createCloud() {
  const group    = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 1.0,
    metalness: 0.0,
  });

  // Esferas com tamanhos variados formando um volume de nuvem
  // [x, y, z, raio]
  const pieces = [
    [ 0.0,  0.0,  0.0, 3.5],   // núcleo central — maior
    [-3.5,  0.0,  0.0, 2.8],
    [ 3.5,  0.0,  0.0, 2.6],
    [-1.8,  2.0,  0.0, 2.2],
    [ 1.8,  1.8,  0.0, 2.4],
    [ 0.0,  2.5,  0.0, 2.0],
    [-4.5, -0.5,  1.0, 1.8],
    [ 4.5, -0.5, -1.0, 1.6],
    [ 0.0, -0.5,  1.5, 2.0],
  ];

  pieces.forEach(([x, y, z, radius]) => {
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 16, 16),
      material
    );
    sphere.position.set(x, y, z);
    group.add(sphere);
  });

  return group;
}