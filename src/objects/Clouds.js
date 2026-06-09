import * as THREE from 'three';

export function createClouds() {

    const clouds = new THREE.Group();

    for(let i = 0; i < 6; i++) {

        const cloud = createCloud();

        cloud.position.set(
            (Math.random() - 0.5) * 60,
            10 + Math.random() * 5,
            -20 + Math.random() * 10
        );

        clouds.add(cloud);
    }

    return clouds;
}

function createCloud() {

    const group = new THREE.Group();

    const material =
        new THREE.MeshStandardMaterial({
            color: 0xffffff
        });

    const pieces = [
        [-1.5, 0, 0, 1.3],
        [0, 0.4, 0, 1.8],
        [1.8, 0, 0, 1.4],
        [0.8, -0.5, 0, 1.2],
        [-0.7, -0.4, 0, 1.1]
    ];

    pieces.forEach(([x, y, z, radius]) => {

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, 20, 20),
            material
        );

        sphere.position.set(x, y, z);

        group.add(sphere);
    });

    return group;
}