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
    this.drawCheckpoints(state.checkpoints);
    this.drawPassengers(state.activePassengers);
    if (state.debugQueue) {
      this.drawQueueSlots(state.queueSlots);
      this.drawQueuePassengers(state.queueSlots);
      this.drawQueueDirections(state.queueSlots);
    }
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

  drawCheckpoints(checkpoints = []) {
    if (!checkpoints?.length) return;
    const { ctx } = this;
    ctx.save();
    checkpoints.forEach((cp, index) => {
      const enabled = cp.enabled !== false;
      ctx.fillStyle = enabled ? '#3f88c5' : '#e26d5c';
      ctx.strokeStyle = enabled ? '#e8f0f7' : '#e26d5c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = enabled ? '#e8f0f7' : '#ffdede';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.fillText(`#${index} ${cp.name}`, cp.x + 14, cp.y + 4);
    });
    ctx.restore();
  }

  drawPassengers(passengers = []) {
    if (!passengers?.length) return;
    const { ctx } = this;
    ctx.save();
    passengers.forEach((p) => {
      const size = 12;
      let fill = '#f6a821';
      let stroke = '#f4d35e';
      if (p.prioridad === 1) {
        fill = '#ffd700';
        stroke = '#ffe680';
      } else if (p.prioridad === 2) {
        fill = '#c0c0c0';
        stroke = '#e0e0e0';
      } else if (p.prioridad === 3) {
        fill = '#cd7f32';
        stroke = '#e1a267';
      } else if (p.prioridad !== null) {
        fill = '#6c7a89';
        stroke = '#9aa7b5';
      }

      // Override borde según decisión/validez
      if (p.decision === 'ACCEPTED') {
        stroke = p.isValid ? '#44bba4' : '#e26d5c';
      }

      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.fillRect(p.position.x - size / 2, p.position.y - size / 2, size, size);
      ctx.strokeRect(p.position.x - size / 2, p.position.y - size / 2, size, size);

      ctx.fillStyle = '#e8f0f7';
      ctx.font = '11px \"Segoe UI\", sans-serif';
      const label = p.prioridad ? `P${p.id} • ${p.prioridad}` : `P${p.id}`;
      ctx.fillText(label, p.position.x + size, p.position.y);
    });
    ctx.restore();
  }

  drawQueueSlots(queueSlots = []) {
    if (!queueSlots.length) return;
    const { ctx } = this;
    ctx.save();
    queueSlots.forEach((slot, index) => {
      const isFront = index === queueSlots.length - 1;
      ctx.strokeStyle = isFront ? '#aad4ff' : slot.occupiedBy ? '#e26d5c' : '#44bba4';
      ctx.lineWidth = isFront ? 3 : 2;
      const size = 38;
      ctx.strokeRect(slot.position.x - size / 2, slot.position.y - size / 2, size, size);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(slot.position.x - size / 2, slot.position.y - size / 2, size, size);
      ctx.fillStyle = isFront ? '#aad4ff' : '#c1c7d0';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText(`#${index}`, slot.position.x - 10, slot.position.y - size / 2 - 4);
      if (slot.occupiedBy) {
        ctx.fillStyle = '#e26d5c';
        ctx.font = '12px "Segoe UI", sans-serif';
        ctx.fillText('X', slot.position.x - 3, slot.position.y + 4);
      }
    });
    ctx.restore();
  }

  drawQueuePassengers(queueSlots = []) {
    if (!queueSlots.length) return;
    const { ctx } = this;
    ctx.save();
    queueSlots.forEach((slot) => {
      const passenger = slot.occupiedBy;
      if (!passenger) return;
      ctx.fillStyle = '#9ad5ff';
      ctx.strokeStyle = '#1f3b5d';
      ctx.lineWidth = 2;
      const w = 24;
      const h = 32;
      ctx.fillRect(passenger.position.x - w / 2, passenger.position.y - h / 2, w, h);
      ctx.strokeRect(passenger.position.x - w / 2, passenger.position.y - h / 2, w, h);
    });
    ctx.restore();
  }

  drawQueueDirections(queueSlots = []) {
    if (queueSlots.length < 2) return;
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < queueSlots.length - 1; i += 1) {
      const a = queueSlots[i].position;
      const b = queueSlots[i + 1].position;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    // Flecha hacia el control: desde el slot lejano (0) al cercano (último).
    const front = queueSlots[queueSlots.length - 1]?.position;
    const back = queueSlots[0]?.position;
    if (front && back) {
      ctx.strokeStyle = '#aad4ff';
      ctx.fillStyle = '#aad4ff';
      ctx.beginPath();
      ctx.moveTo(back.x, back.y);
      ctx.lineTo(front.x, front.y);
      ctx.stroke();
      // Pequeña punta de flecha cerca del frente
      const angle = Math.atan2(front.y - back.y, front.x - back.x);
      const size = 8;
      ctx.beginPath();
      ctx.moveTo(front.x, front.y);
      ctx.lineTo(front.x - size * Math.cos(angle - Math.PI / 6), front.y - size * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(front.x - size * Math.cos(angle + Math.PI / 6), front.y - size * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}
