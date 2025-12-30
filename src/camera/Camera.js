import Vector2 from '../utils/Vector2.js';

export default class Camera {
  constructor() {
    this.position = new Vector2();
    this.viewport = new Vector2(0, 0);
  }

  setViewport(width, height) {
    this.viewport.set(width, height);
  }
}
