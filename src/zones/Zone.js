export default class Zone {
  constructor({ id, name, bounds }) {
    this.id = id;
    this.name = name;
    this.bounds = bounds; // { x, y, width, height }
  }

  contains(point) {
    const { x, y, width, height } = this.bounds;
    return (
      point.x >= x &&
      point.x <= x + width &&
      point.y >= y &&
      point.y <= y + height
    );
  }
}
