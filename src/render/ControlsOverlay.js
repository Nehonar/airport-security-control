export default class ControlsOverlay {
  constructor(root = document.body) {
    this.root = root;
    this.container = document.createElement('div');
    this.container.className = 'controls-overlay';
    this.root.appendChild(this.container);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="controls-title">Controles</div>
      <div class="controls-grid">
        <span>WASD / Flechas</span><span>Mover</span>
        <span>E / Espacio / Enter</span><span>Interactuar (entrar inspección)</span>
        <span>F</span><span>Aceptar pasajero</span>
        <span>R</span><span>Rechazar pasajero</span>
        <span>Esc</span><span>Salir de inspección</span>
      </div>
    `;
  }
}
