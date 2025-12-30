const COLORS = {
  background: '#0f2438',
  hud: '#1f3b5d',
  text: '#e8f0f7',
  accents: ['#3f88c5', '#44bba4', '#e26d5c'],
};

export default class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  render(state) {
    this.clear();
    this.drawZones();
    this.drawHUD(state);
  }

  clear() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawZones() {
    const { ctx, canvas } = this;
    const zoneWidth = canvas.width / 3;

    COLORS.accents.forEach((color, index) => {
      const x = index * zoneWidth;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 8, 60, zoneWidth - 16, canvas.height - 120);

      ctx.fillStyle = color;
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText(`Zona ${index + 1}`, x + 18, 48);
    });
  }

  drawHUD(state) {
    const { ctx, canvas } = this;
    const remaining = Math.max(0, state.duration - state.elapsed);
    const seconds = Math.ceil(remaining / 1000);

    ctx.fillStyle = COLORS.hud;
    ctx.fillRect(0, 0, canvas.width, 40);

    ctx.fillStyle = COLORS.text;
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(`Tiempo restante: ${seconds}s`, 16, 24);

    ctx.textAlign = 'right';
    ctx.fillText('Bootstrap fase 0.1 activo', canvas.width - 16, 24);
    ctx.textAlign = 'left';
  }
}
