import Vector2 from '../utils/Vector2.js';

export default class Passenger {
  constructor({
    id,
    name,
    flightId,
    isValid = null,
    invalidReason = undefined,
    decision = undefined,
    outcome = undefined,
    position = new Vector2(),
  }) {
    this.id = id;
    this.name = name;
    this.flightId = flightId;
    this.isValid = isValid;
    this.invalidReason = invalidReason;
    this.decision = decision;
    this.outcome = outcome;
    this.position = position instanceof Vector2 ? position : new Vector2(position.x, position.y);
    this.assignedSlot = null;
    // Navegación básica
    this.speed = 60 + Math.random() * 40; // px/s
    this.currentTarget = 0;

    // Navegación avanzada (prioridades y clusters)
    this.clusterId = null;
    this.prioridad = null;
    this.npcsDetectados = [];
    this.detectionRadius = 30;
    this.avoidanceStrength = 0.3;
    this.queuePosition = null;
    this.queuePositionZigzag = null;
  }

  detectarNPCsCercanos(todos = [], radio = this.detectionRadius) {
    this.npcsDetectados = [];
    for (const other of todos) {
      if (other.id === this.id) continue;
      const dx = other.position.x - this.position.x;
      const dy = other.position.y - this.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist < radio) {
        this.npcsDetectados.push({ npc: other, distancia: dist });
      }
    }
    this.npcsDetectados.sort((a, b) => a.distancia - b.distancia);
    return this.npcsDetectados.length;
  }

  puedeTraspasar(otroNPC) {
    if (this.prioridad === null || otroNPC.prioridad === null) return false;
    if (this.clusterId === null || otroNPC.clusterId === null) return false;
    if (this.clusterId !== otroNPC.clusterId) return false;
    return this.prioridad < otroNPC.prioridad;
  }

  enZonaEspecial() {
    // Punto de extensión futuro; por ahora no hay zonas especiales activas.
    return false;
  }
}
