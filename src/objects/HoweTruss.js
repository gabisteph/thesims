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
  { kg: 3,  scale: 1.40 },
  { kg: 6,  scale: 2.55 },
  { kg: 9,  scale: 3.70 },
  { kg: 12, scale: 4.85 },
  { kg: 15, scale: 5.425 },
  { kg: 18, scale: 6.00 },  // estágio final: 6x maior
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
    if (len < 1e-6) return;

    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, len, 10),
      mat
    );
    mesh.position.copy(start).lerp(end, 0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    group.add(mesh);
  }

  function buildFace(z) {
    // Banzo inferior (tração, 1 palito)
    bar(A(z), B(z));
    bar(B(z), C(z));
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

  buildFace(-DEPTH / 2);
  buildFace( DEPTH / 2);

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

  group.position.y = TRUSS_BASE_Y;

  // Expõe o pivô do balde para que o SceneManager possa escalá-lo
  // dinamicamente durante a animação de carga.
  group.userData.bucketPivot = bucketPivot;

  return group;
}