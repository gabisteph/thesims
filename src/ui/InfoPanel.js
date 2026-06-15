export function createInfoPanel(){

const panel =
document.createElement(
'div'
);

panel.className =
'info-panel';

panel.innerHTML=
`
<h3>Treliça Howe</h3>

<p>Estrutura 3D</p>

<p>Ensaio com balde</p>
`;

document.body.append(
panel
);

}