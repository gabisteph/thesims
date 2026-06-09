import * as THREE from 'three';

import { TRUSS_CONFIG }
from '../constants/trussConfig';

import { createBar }
from '../utils/createBar';

export function createHoweTruss() {

    const group =
        new THREE.Group();

    const {
        span,
        height,
        panels,
        barRadius,
        nodeRadius
    } = TRUSS_CONFIG;

    const white =
        new THREE.MeshStandardMaterial({
            color: '#eaeaea'
        });

    const blue =
        new THREE.MeshStandardMaterial({
            color: '#2E86FF'
        });

    const yellow =
        new THREE.MeshStandardMaterial({
            color: '#F5C518'
        });

    const nodes = [];

    for(let i = 0; i <= panels; i++) {

        const x =
            -span / 2 +
            (span / panels) * i;

        nodes.push({
            bottom:
                new THREE.Vector3(
                    x,
                    0,
                    0
                ),
            top:
                new THREE.Vector3(
                    x,
                    height,
                    0
                )
        });
    }

    for(let i = 0; i < panels; i++) {

        group.add(
            createBar(
                nodes[i].bottom,
                nodes[i + 1].bottom,
                barRadius,
                white
            )
        );

        group.add(
            createBar(
                nodes[i].top,
                nodes[i + 1].top,
                barRadius,
                white
            )
        );

        group.add(
            createBar(
                nodes[i].bottom,
                nodes[i].top,
                barRadius,
                white
            )
        );
    }

    for(let i = 0; i < panels / 2; i++) {

        group.add(
            createBar(
                nodes[i].top,
                nodes[i + 1].bottom,
                barRadius,
                blue
            )
        );
    }

    for(let i = panels / 2; i < panels; i++) {

        group.add(
            createBar(
                nodes[i].bottom,
                nodes[i + 1].top,
                barRadius,
                blue
            )
        );
    }

    nodes.forEach(node => {

        const bottom =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    nodeRadius,
                    16,
                    16
                ),
                yellow
            );

        bottom.position.copy(
            node.bottom
        );

        group.add(bottom);

        const top =
            bottom.clone();

        top.position.copy(
            node.top
        );

        group.add(top);
    });

    group.position.y = 3;

    return group;
}