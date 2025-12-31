export default class MovementSystem {
  constructor() {
    this.active = true;
  }

  update({ player, input, deltaSeconds, bounds }) {
    if (!this.active || !player || !input) return;

    const speed = player.speed ?? 200; // px/s
    player.velocity.set(input.direction.x * speed, input.direction.y * speed);

    const dx = player.velocity.x * deltaSeconds;
    const dy = player.velocity.y * deltaSeconds;
    player.position.x += dx;
    player.position.y += dy;

    if (bounds) {
      const maxX = bounds.width - player.size.x;
      const maxY = bounds.height - player.size.y;
      player.position.x = Math.max(0, Math.min(player.position.x, maxX));
      player.position.y = Math.max(0, Math.min(player.position.y, maxY));
    }
  }
}
