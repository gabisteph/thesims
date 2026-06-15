import * as THREE from 'three';
import { createCamera }   from './Camera';
import { createRenderer } from './Renderer';
import { createLights }   from './Lights';
import { createGround }   from '../objects/Ground';
import { createClouds }   from '../objects/Clouds';
import { createSupports } from '../objects/Supports';
import { createHoweTruss } from '../objects/HoweTruss';
import { createInfoPanel } from '../ui/InfoPanel';

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#87CEEB');

    this.camera   = createCamera();
    this.renderer = createRenderer();

    createLights(this.scene);
    this.scene.add(createGround());
    this.scene.add(createClouds());
    this.scene.add(createSupports());

    this.truss = createHoweTruss();
    this.scene.add(this.truss);

    createInfoPanel();

    // ── Órbita da câmera ──────────────────────────────────────────────────────
    // A câmera gira em torno da estrutura — a treliça e os apoios ficam parados

    // Ponto central em torno do qual orbita (centro geométrico da estrutura)
    this.orbitTarget = new THREE.Vector3(0, 5.5, 0);

    // Lê a posição inicial definida em Camera.js para não duplicar valores
    const init = this.camera.position;
    this.orbitRadius = Math.sqrt(init.x ** 2 + init.z ** 2); // distância horizontal
    this.orbitHeight = init.y;                                // mantém a altura fixa
    this.orbitAngle  = Math.atan2(init.z, init.x);           // ângulo inicial

    // Uma volta completa em ~20 segundos (assumindo ~60fps)
    this.orbitSpeed = (2 * Math.PI) / (20 * 60);

    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  animate() {
    // para parar a animação, basta não chamar mais requestAnimationFrame: só comentar
    requestAnimationFrame(this.animate.bind(this));

    // Avança o ângulo orbital
    this.orbitAngle += this.orbitSpeed;

    // Reposiciona a câmera em círculo ao redor do target
    this.camera.position.set(
      this.orbitTarget.x + this.orbitRadius * Math.cos(this.orbitAngle),
      this.orbitHeight,
      this.orbitTarget.z + this.orbitRadius * Math.sin(this.orbitAngle)
    );

    // Câmera sempre aponta para o centro da estrutura
    this.camera.lookAt(this.orbitTarget);

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}