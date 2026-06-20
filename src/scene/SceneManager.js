import * as THREE from 'three';
import { createCamera }   from './Camera';
import { createRenderer } from './Renderer';
import { createLights }   from './Lights';
import { createGround }   from '../objects/Ground';
import { createClouds }   from '../objects/Clouds';
import { createSupports } from '../objects/Supports';
import { createHoweTruss, breakTruss, LOAD_STAGES } from '../objects/HoweTruss';
import { createInfoPanel, updateWeightDisplay } from '../ui/InfoPanel';

// LOAD_STAGES vem do HoweTruss.js:
//   [{kg:0, scale:0.25}, {kg:3,...}, ..., {kg:18, scale:6.00}]
// O estágio 0 (kg:0) é o estado inicial e já é aplicado na criação da treliça;
// os estágios de 1 em diante (3,6,9,12,15,18 kg) avançam de 2 em 2 segundos.
const STAGE_INTERVAL_MS  = 2000;
const POST_BREAK_DELAY_MS = 2000; // espera 2s no estágio 18kg antes de quebrar

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#87CEEB');

    this.camera   = createCamera();
    this.renderer = createRenderer();

    createLights(this.scene);
    this.scene.add(createGround());
    //this.scene.add(createClouds());
    this.scene.add(createSupports());

    this.truss = createHoweTruss();
    this.scene.add(this.truss);

    createInfoPanel();

    // Pivô do balde, exposto pelo HoweTruss.js para ser escalado de fora
    this.bucketPivot = this.truss.userData.bucketPivot;

    // Função de update da animação de ruptura (null até ser disparada)
    this.breakUpdate = null;
    this.clock = new THREE.Clock();

    this.animate();
    window.addEventListener('resize', this.onResize.bind(this));

    // ── Inicia a sequência de carga (3, 6, 9, 12, 15, 18 kg) ───────────────────
    this.startLoadSequence();
  }

  startLoadSequence() {
    // Estágio 0 (kg:0, escala 0.25x) já é o estado inicial da treliça —
    // avançamos a partir do índice 1 (3kg).
    this.currentStage = 1;
    this.applyStage(this.currentStage);

    this.loadInterval = setInterval(() => {
      this.currentStage++;

      if (this.currentStage >= LOAD_STAGES.length) {
        clearInterval(this.loadInterval);

        // Último estágio (18kg) atingido — espera um pouco e quebra a treliça
        setTimeout(() => this.startBreakSequence(), POST_BREAK_DELAY_MS);
        return;
      }

      this.applyStage(this.currentStage);
    }, STAGE_INTERVAL_MS);
  }

  applyStage(stageIndex) {
    const { kg, scale } = LOAD_STAGES[stageIndex];

    if (this.bucketPivot) {
      this.bucketPivot.scale.setScalar(scale);
    }

    updateWeightDisplay(kg);
  }

  startBreakSequence() {
    // Dispara a animação de ruptura: a barra C-D se separa e o balde
    // cai com gravidade simples até o chão. breakTruss() devolve uma
    // função update(dt) que vamos chamar a cada frame em animate().
    this.breakUpdate = breakTruss(this.truss, () => {
      // Callback ao tocar o chão — a cena fica parada (fim do ensaio)
      this.breakUpdate = null;
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const dt = this.clock.getDelta();
    if (this.breakUpdate) {
      this.breakUpdate(dt);
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}