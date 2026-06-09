import * as THREE from 'three';

export function createSupports() {

    const group =
        new THREE.Group();

    const geometry =
        new THREE.BoxGeometry(
            3,
            3,
            3
        );

    const material =
        new THREE.MeshStandardMaterial({
            color: '#D6C5A4'
        });

    const left =
        new THREE.Mesh(
            geometry,
            material
        );

    left.position.set(
        -10,
        1.5,
        0
    );

    const right =
        left.clone();

    right.position.x = 10;

    group.add(left);
    group.add(right);

    return group;
}