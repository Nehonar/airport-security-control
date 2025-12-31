export default class InteractionSystem {
  constructor({ area }) {
    this.area = area; // { x, y, width, height }
    this.canInspect = false;
  }

  update(player) {
    if (!player || !this.area) return this.canInspect;
    const next = this.contains(player);
    if (next !== this.canInspect) {
      this.canInspect = next;
      console.info(next ? '[Interaction] Puede inspeccionar' : '[Interaction] Fuera de puesto');
    }
    return this.canInspect;
  }

  contains(player) {
    const px = player.position.x;
    const py = player.position.y;
    const { x, y, width, height } = this.area;
    return px >= x && px <= x + width && py >= y && py <= y + height;
  }
}
