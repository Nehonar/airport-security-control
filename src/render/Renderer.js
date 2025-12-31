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
    this.ctx.save();
    this.applyCamera(state.camera);
    this.drawZones(state.zones, state.activeZoneId);
    this.drawInteractionArea(state.interactionArea, state.canInspect);
    this.drawPlayer(state.player);
    this.ctx.restore();
    this.drawHUD(state);
  }

  clear() {
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawZones(zones = [], activeZoneId = null) {
    const { ctx } = this;
    const accents = COLORS.accents;

    zones.forEach((zone, index) => {
      const color = accents[index % accents.length];
      const { x, y, width, height } = zone.bounds;
      const isActive = zone.id === activeZoneId;
      ctx.strokeStyle = color;
      ctx.lineWidth = isActive ? 3 : 2;
      ctx.globalAlpha = isActive ? 0.18 : 0.12;
      ctx.fillStyle = color;
      ctx.fillRect(x + 8, y + 60, width - 16, height - 120);
      ctx.globalAlpha = 1;
      ctx.strokeRect(x + 8, y + 60, width - 16, height - 120);

      ctx.fillStyle = color;
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText(zone.name, x + 18, y + 48);
    });
  }

  drawHUD(state) {
    const { ctx, canvas } = this;
    const remaining = Math.max(0, state.durationMs - state.elapsedMs);
    const seconds = Math.ceil(remaining / 1000);
    const clock = state.clock ?? { time: '--:--', mode: 'NORMAL', multiplier: 1 };

    ctx.fillStyle = COLORS.hud;
    ctx.fillRect(0, 0, canvas.width, 40);

    ctx.fillStyle = COLORS.text;
    ctx.font = '14px "Segoe UI", sans-serif';
    ctx.fillText(`Tiempo restante: ${seconds}s`, 16, 24);

    ctx.textAlign = 'center';
    ctx.fillText(`Hora: ${clock.time} | Ritmo x${clock.multiplier.toFixed(2)} (${clock.mode === 'DOCUMENT_INSPECTION' ? 'INSPECCIÓN' : 'NORMAL'})`, canvas.width / 2, 24);

    ctx.textAlign = 'right';
    ctx.fillText('Bootstrap fase 0.1 activo', canvas.width - 16, 24);
    ctx.textAlign = 'left';
  }

  drawPlayer(player) {
    if (!player) return;
    const { ctx } = this;
    ctx.fillStyle = '#f4d35e';
    ctx.strokeStyle = '#f6a821';
    ctx.lineWidth = 2;
    ctx.fillRect(player.position.x, player.position.y, player.size.x, player.size.y);
    ctx.strokeRect(player.position.x, player.position.y, player.size.x, player.size.y);
  }

  applyCamera(camera) {
    if (!camera) return;
    this.ctx.translate(-camera.position.x, -camera.position.y);
  }

  drawInteractionArea(area, canInspect) {
    if (!area) return;
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = canInspect ? '#44bba4' : '#e26d5c';
    ctx.fillStyle = canInspect ? 'rgba(68, 187, 164, 0.08)' : 'rgba(226, 109, 92, 0.05)';
    ctx.lineWidth = canInspect ? 3 : 2;
    ctx.fillRect(area.x, area.y, area.width, area.height);
    ctx.strokeRect(area.x, area.y, area.width, area.height);

    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = '13px "Segoe UI", sans-serif';
    ctx.fillText(canInspect ? 'Puedes inspeccionar' : 'Acércate al puesto', area.x + 8, area.y + 18);
    ctx.restore();
  }
}
