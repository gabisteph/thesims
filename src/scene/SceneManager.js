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

    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}