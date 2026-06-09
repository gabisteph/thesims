import * as THREE from 'three';

export function createRenderer() {

    const renderer =
        new THREE.WebGLRenderer({
            antialias: true
        });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.shadowMap.enabled = true;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.3;

    document.body.appendChild(
        renderer.domElement
    );

    return renderer;
}