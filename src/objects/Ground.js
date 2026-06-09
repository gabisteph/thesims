import * as THREE from 'three';

export function createGround() {

    const geometry =
        new THREE.PlaneGeometry(
            100,
            100
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: '#7BC943'
        });

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.rotation.x =
        -Math.PI / 2;

    mesh.receiveShadow = true;

    return mesh;
}