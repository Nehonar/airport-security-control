import Vector2 from '../utils/Vector2.js';

export default class QueueMovementSystem {
  constructor({ speed = 60, epsilon = 1.5, playerAvoidRadius = 28 } = {}) {
    this.speed = speed; // px/s
    this.epsilon = epsilon;
    this.playerAvoidRadius = playerAvoidRadius;
  }

  update({ slots = [], deltaSeconds, player }) {
    slots.forEach((slot) => {
      const passenger = slot.occupiedBy;
      if (!passenger) return;
      if (this.isPathBlockedByPlayer(passenger.position, slot.position, player)) return;
      this.moveTowards(passenger.position, slot.position, deltaSeconds);
    });
  }

  moveTowards(position, target, deltaSeconds) {
    const toTarget = new Vector2(target.x - position.x, target.y - position.y);
    const distance = Math.hypot(toTarget.x, toTarget.y);
    if (distance <= this.epsilon) {
      position.set(target.x, target.y);
      return;
    }
    const step = Math.min(distance, this.speed * deltaSeconds);
    position.x += (toTarget.x / distance) * step;
    position.y += (toTarget.y / distance) * step;
  }

  isPathBlockedByPlayer(from, to, player) {
    if (!player) return false;
    const px = player.position.x;
    const py = player.position.y;
    // Vector from -> to
    const vx = to.x - from.x;
    const vy = to.y - from.y;
    const lenSq = vx * vx + vy * vy;
    if (lenSq === 0) {
      // Already at target; consider blocked only if overlapping.
      const dist = Math.hypot(px - from.x, py - from.y);
      return dist < this.playerAvoidRadius;
    }
    // Project player onto segment to check closest approach.
    const t = Math.max(0, Math.min(1, ((px - from.x) * vx + (py - from.y) * vy) / lenSq));
    const closestX = from.x + t * vx;
    const closestY = from.y + t * vy;
    const dist = Math.hypot(px - closestX, py - closestY);
    return dist < this.playerAvoidRadius;
  }
}
