import * as THREE from 'three';

export function createBar(
    start,
    end,
    radius,
    material
) {
    const direction =
        new THREE.Vector3()
            .subVectors(end, start);

    const length =
        direction.length();

    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            length,
            12
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.copy(
        start.clone()
            .add(end)
            .multiplyScalar(0.5)
    );

    mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.normalize()
    );

    return mesh;
}