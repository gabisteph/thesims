import * as THREE from 'three';

/**
 * Treliça Howe de palitos — geometria ótima do AG
 * Valores do AG (relatório Seção 8.2):
 *   p1=10.900, p2=9.129, p3=9.177, p4=10.795  cm
 *   h1= 3.000, h2=6.809, h3=10.241, h4=6.764, h5=3.000  cm
 */

export const TRUSS_SCALE = 0.5;
export const TRUSS_DEPTH = 3.0;

const SCALE = TRUSS_SCALE;
const DEPTH = TRUSS_DEPTH;

const P = [10.900, 9.129, 9.177, 10.795];
const H = [3.000, 6.809, 10.241, 6.764, 3.000];

const R1 = 0.10;   // 1 palito
const R2 = 0.14;   // 2 palitos

const xE   = P[0] + P[1] + P[2] + P[3];
const xMid = xE / 2;

export const TRUSS_HALF_SPAN = xMid * SCALE;
export const TRUSS_BASE_Y    = 3.0;

// ── Estágios da animação de carga do balde ─────────────────────────────────
// 6 estágios: peso sobe de 3 em 3 kg (3,6,9,12,15,18), escala visual do
// balde sobe de 1/4x (estágio 0, antes de qualquer peso) até 6x (estágio 6).
export const LOAD_STAGES = [
  { kg: 0,  scale: 0.25 },  // estado inicial: balde vazio, 4x menor
  { kg: 3,  scale: 0.25 },
  { kg: 6,  scale: 0.75 },
  { kg: 9,  scale: 1.25 },
  { kg: 12, scale: 1.75 },
  { kg: 15, scale: 2.25 },
  { kg: 18, scale: 2.75 },  // estágio final: crescimento sutil, +0.5x por estágio
];

export function createHoweTruss() {
  const group = new THREE.Group();

  const woodMat = new THREE.MeshStandardMaterial({ color: '#C88B55', roughness: 0.85 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: '#cccccc', roughness: 0.6 });
  const buckMat = new THREE.MeshStandardMaterial({ color: '#888888', roughness: 0.5 });

  const xA = 0;
  const xB = P[0];
  const xC = P[0] + P[1];
  const xD = P[0] + P[1] + P[2];

  function pt(x, y, z) {
    return [(x - xMid) * SCALE, y * SCALE, z];
  }

  const A  = (z) => pt(xA, 0,    z);
  const B  = (z) => pt(xB, 0,    z);
  const C  = (z) => pt(xC, 0,    z);
  const D  = (z) => pt(xD, 0,    z);
  const E  = (z) => pt(xE, 0,    z);
  const F  = (z) => pt(xA, H[0], z);
  const G  = (z) => pt(xB, H[1], z);
  const Hh = (z) => pt(xC, H[2], z);
  const I  = (z) => pt(xD, H[3], z);
  const J  = (z) => pt(xE, H[4], z);

  function bar(a, b, radius = R1, mat = woodMat) {
    const start = new THREE.Vector3(...a);
    const end   = new THREE.Vector3(...b);
    const dir   = new THREE.Vector3().subVectors(end, start);
    const len   = dir.length();
    if (len < 1e-6) return null;

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, len, 10),
      mat
    );
    mesh.position.copy(start).lerp(end, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    group.add(mesh);
    return mesh;
  }

  // ── Barra fraturável B-C ──────────────────────────────────────────────────
  // Em vez de uma mesh única, B-C é modelada como duas meias-barras, cada
  // uma dentro de um PIVÔ posicionado na extremidade que permanece fixa
  // (B para a metade esquerda, C para a metade direita). Assim, ao girar
  // o pivô, a ponta SOLTA (a do meio, onde ocorre a fratura) cai para
  // baixo como uma dobradiça quebrando — em vez de girar em torno do
  // próprio centro da barra, o que dava a impressão de subir.
  function breakableBar(a, b, radius = R1, mat = woodMat) {
    const start = new THREE.Vector3(...a); // extremidade fixa da metade A (ex: B)
    const end   = new THREE.Vector3(...b); // extremidade fixa da metade B (ex: C)
    const mid   = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const halfLen = start.distanceTo(mid);

    // Pivô A: ancorado em `start`, a barra desenhada de (0,0,0) até o vetor
    // local que aponta para `mid`. Rotacionar este pivô faz a ponta em
    // `mid` (a fratura) se mover, mantendo `start` fixo.
    const pivotA = new THREE.Group();
    pivotA.position.copy(start);
    const dirA = new THREE.Vector3().subVectors(mid, start);
    const meshA = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, halfLen, 10),
      mat
    );
    meshA.position.copy(dirA).multiplyScalar(0.5);
    meshA.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirA.clone().normalize());
    pivotA.add(meshA);
    group.add(pivotA);

    // Pivô B: ancorado em `end`, simétrico ao pivô A
    const pivotB = new THREE.Group();
    pivotB.position.copy(end);
    const dirB = new THREE.Vector3().subVectors(mid, end);
    const meshB = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, halfLen, 10),
      mat
    );
    meshB.position.copy(dirB).multiplyScalar(0.5);
    meshB.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirB.clone().normalize());
    pivotB.add(meshB);
    group.add(pivotB);

    // halfA/halfB expostos para a animação agora são os PIVÔS (não as meshes),
    // já que é o pivô que precisa rotacionar para a queda parecer correta.
    return { halfA: pivotA, halfB: pivotB };
  }

  // Guarda as duas metades fraturáveis da barra C-D, em ambas as faces
  // (frente e fundo), para que o SceneManager possa animá-las na ruptura.
  const breakableHalves = [];

  function buildFace(z, breakable) {
    // Banzo inferior (tração, 1 palito)
    bar(A(z), B(z));

    // A barra B-C só é fraturável na face marcada como `breakable`;
    // a outra face mantém a barra inteira (treliça não se desmonta dos dois lados)
    if (breakable) {
      breakableHalves.push(breakableBar(B(z), C(z)));
    } else {
      bar(B(z), C(z));
    }

    bar(C(z), D(z));
    bar(D(z), E(z));

    // Barras superiores (compressão, 2 palitos)
    bar(F(z),  G(z),  R2);
    // bar(G(z),  Hh(z), R2);  ← REMOVIDA: tirava o pico H, substituída pela diagonal G-I
    // bar(Hh(z), I(z),  R2);  ← REMOVIDA: idem
    bar(I(z),  J(z),  R2);

    // Verticais externas (compressão, 1 palito)
    bar(A(z), F(z));
    bar(E(z), J(z));

    // Verticais internas (compressão, 1 palito)
    bar(G(z),  B(z));
    // bar(Hh(z), C(z));  ← REMOVIDA: H não tem mais ligação com o banzo superior
    bar(I(z),  D(z));

    // Diagonais (tração, 1 palito)
    bar(F(z), B(z));
    bar(G(z), C(z));
    bar(I(z), C(z));
    bar(J(z), D(z));

    // Diagonal cruzada do losango central — liga G a I, cruzando H-C no meio
    bar(G(z), I(z));
  }

  // Só a face frontal (z negativo) sofre a ruptura — a traseira mantém
  // a barra C-D inteira, como pedido (quebra de um lado só).
  buildFace(-DEPTH / 2, true);
  buildFace( DEPTH / 2, false);

  // Longarinas transversais
  [A, B, C, D, E].forEach(n => bar(n(-DEPTH / 2), n(DEPTH / 2)));
  [F, G, I, J].forEach(n => bar(n(-DEPTH / 2), n(DEPTH / 2), R2));

  // Balde no nó C — geometria de referência criada no tamanho "1x" (padrão).
  // A escala real aplicada (1/4x a 6x) é controlada de fora via bucket.scale,
  // e o bucket.userData guarda o ponto de ancoragem (topo da corda) para que
  // o crescimento aconteça "para baixo", mantendo o topo fixo na corda.
  const cPos    = pt(xC, 0, 0);
  const ropeLen = 1.2;

  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, ropeLen, 8),
    ropeMat
  );
  rope.position.set(cPos[0], cPos[1] - ropeLen / 2, 0);
  group.add(rope);

  // Grupo-pivô: a âncora (ponto onde a corda termina) fica na origem do pivô,
  // e o balde fica deslocado para baixo dentro dele. Assim, escalar o PIVÔ
  // (não o bucket direto) faz o balde crescer para baixo a partir do topo.
  const bucketAnchorY = cPos[1] - ropeLen; // ponto onde a corda termina

  const bucketPivot = new THREE.Group();
  bucketPivot.position.set(cPos[0], bucketAnchorY, 0);

  const BUCKET_TOP_R    = 1.4;
  const BUCKET_BOTTOM_R = 1.0;
  const BUCKET_HEIGHT   = 2.2;

  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(BUCKET_TOP_R, BUCKET_BOTTOM_R, BUCKET_HEIGHT, 20),
    buckMat
  );
  // Desloca o balde para baixo dentro do pivô, de forma que o topo do
  // balde toque o ponto de ancoragem (y=0 local)
  bucket.position.set(0, -BUCKET_HEIGHT / 2, 0);
  bucketPivot.add(bucket);
  group.add(bucketPivot);

  // Escala inicial: balde começa em 1/4x (4 vezes menor que o tamanho de referência)
  bucketPivot.scale.setScalar(0.25);

  group.position.y = TRUSS_BASE_Y;

  // Expõe o pivô do balde para que o SceneManager possa escalá-lo
  // dinamicamente durante a animação de carga.
  group.userData.bucketPivot = bucketPivot;

  // Expõe a corda e as metades fraturáveis de C-D para a animação de ruptura.
  group.userData.rope = rope;
  group.userData.breakableHalves = breakableHalves; // [{halfA, halfB}, {halfA, halfB}]

  return group;
}

/**
 * Anima a ruptura da barra C-D e a queda do balde com gravidade simples.
 *
 * @param trussGroup  o grupo retornado por createHoweTruss()
 * @param onComplete  callback chamado quando o balde toca o chão (opcional)
 * @returns função update(deltaSeconds) a ser chamada a cada frame; retorna
 *          true enquanto a animação está em andamento, false quando termina.
 */
export function breakTruss(trussGroup, onComplete) {
  const { bucketPivot, rope, breakableHalves } = trussGroup.userData;

  // ── Fase 1: separação da fratura ────────────────────────────────────────────
  const breakRotationSpeed = 1.2; // rad/s, só durante a fase 1
  const BREAK_DURATION = 0.4;     // segundos de "abertura" da fratura

  // ── Fase 2: queda do balde com gravidade ────────────────────────────────────
  const GRAVITY = -30; // unidades/s²
  let velocityY = 0;

  // ── Fase 3: submersão no Rio Negro ──────────────────────────────────────────
  // Em coordenadas locais do trussGroup, o nível da água (y=0 na cena)
  // corresponde a y = -TRUSS_BASE_Y, já que o grupo inteiro está deslocado
  // verticalmente por TRUSS_BASE_Y.
  const waterYLocal     = -TRUSS_BASE_Y;
  const SINK_DEPTH       = 3.5;   // quanto o balde desce dentro da água antes de desaparecer
  const SINK_DURATION    = 1.2;   // segundos para descer essa profundidade e sumir
  let sinkElapsed = 0;
  let sinkStartY  = 0;
  let sinkStartRopeY = 0;

  // Materiais do balde/corda, para aplicar fade-out (precisam suportar transparência)
  function enableTransparency(obj) {
    if (!obj) return;
    obj.traverse?.((child) => {
      if (child.material) {
        child.material.transparent = true;
      }
    });
    if (obj.material) obj.material.transparent = true;
  }

  function setOpacity(obj, value) {
    if (!obj) return;
    if (obj.material) obj.material.opacity = value;
    obj.traverse?.((child) => {
      if (child.material) child.material.opacity = value;
    });
  }

  let elapsed = 0;
  let phase = 'breaking'; // 'breaking' -> 'falling' -> 'sinking' -> 'done'

  function update(dt) {
    elapsed += dt;

    if (phase === 'breaking') {
      // halfA é o pivô ancorado em B (extremidade esquerda fixa); sua ponta
      // solta (em C) precisa cair para baixo → rotação NEGATIVA em Z faz
      // a ponta que está à direita do pivô descer.
      // halfB é o pivô ancorado em C (extremidade direita fixa); sua ponta
      // solta (em B) também precisa cair para baixo → rotação POSITIVA em Z,
      // já que a ponta está à esquerda do pivô.
      breakableHalves.forEach(({ halfA, halfB }) => {
        if (halfA) halfA.rotation.z -= breakRotationSpeed * dt;
        if (halfB) halfB.rotation.z += breakRotationSpeed * dt;
      });

      if (elapsed >= BREAK_DURATION) {
        phase = 'falling';
      }
      return true;
    }

    if (phase === 'falling') {
      // Gravidade simples: v += g*dt; posição += v*dt
      velocityY += GRAVITY * dt;

      const dy = velocityY * dt;
      if (rope) rope.position.y += dy;
      if (bucketPivot) bucketPivot.position.y += dy;

      // Verifica se o balde tocou a superfície da água
      const pivotY = bucketPivot ? bucketPivot.position.y : Infinity;
      if (pivotY <= waterYLocal) {
        // Encosta exatamente na superfície da água antes de começar a submergir
        const correction = waterYLocal - pivotY;
        if (rope) rope.position.y += correction;
        if (bucketPivot) bucketPivot.position.y += correction;

        enableTransparency(rope);
        enableTransparency(bucketPivot);

        sinkStartY      = bucketPivot ? bucketPivot.position.y : waterYLocal;
        sinkStartRopeY  = rope ? rope.position.y : waterYLocal;
        sinkElapsed     = 0;
        phase = 'sinking';
      }
      return true;
    }

    if (phase === 'sinking') {
      sinkElapsed += dt;
      const t = Math.min(sinkElapsed / SINK_DURATION, 1);

      // Desce suavemente (ease-out) enquanto desaparece
      const eased = 1 - Math.pow(1 - t, 2);
      const offset = -SINK_DEPTH * eased; // deslocamento negativo (para baixo)

      if (bucketPivot) bucketPivot.position.y = sinkStartY + offset;
      if (rope) rope.position.y = sinkStartRopeY + offset;

      const opacity = 1 - t; // fade-out linear até 0
      setOpacity(rope, opacity);
      setOpacity(bucketPivot, opacity);

      if (t >= 1) {
        phase = 'done';
        if (onComplete) onComplete();
        return false;
      }
      return true;
    }

    return false;
  }

  return update;
}