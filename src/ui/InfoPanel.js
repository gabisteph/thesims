export function createInfoPanel() {

    const panel =
        document.createElement('div');

    panel.className =
        'info-panel';

    panel.innerHTML = `
        <h2>TRELIÇA HOWE</h2>

        <p>Montantes (Verticais)</p>
        <p>Diagonais (Compressão)</p>
        <p>Cordas Superior e Inferior</p>
        <p>Nós (Conexões)</p>

        <hr>

        <p>Vão: 20m</p>
        <p>Altura: 4m</p>
        <p>Painéis: 8</p>
        <p>Material: Aço</p>
    `;

    document.body.appendChild(
        panel
    );
}