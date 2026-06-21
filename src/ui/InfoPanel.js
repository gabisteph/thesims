export function createInfoPanel() {
  const panel = document.createElement('div');
  panel.className = 'info-panel';
  panel.innerHTML = `
    <h3>Equipe The Sims</h3>
    <p>Estrutura 3D da treliça</p>
    <p>Massa da Treliça: 122g</p>
    <h4>Ensaio com peso</h4>
    <p>Carga Inicial: 0</p>
    <p id="weight-display" style="margin-top:8px;">Carga: 0 kg</p>
  `;
  document.body.append(panel);
}

/**
 * Atualiza o valor de carga exibido no painel.
 * Chamado pelo SceneManager a cada estágio da animação (3, 6, 9, 12, 15, 18 kg).
 */
export function updateWeightDisplay(kg) {
  const el = document.getElementById('weight-display');
  if (el) {
    el.textContent = `Carga Atual ≈ ${kg} kg`;
  }
}