import Vector2 from '../utils/Vector2.js';

export default class Player {
  constructor({ position = new Vector2(), velocity = new Vector2(), size = new Vector2(32, 48) } = {}) {
    this.position = position;
    this.velocity = velocity;
    this.size = size;
    this.speed = 200; // px/s
  }
}
