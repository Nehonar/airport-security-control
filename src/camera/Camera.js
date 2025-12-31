import Vector2 from '../utils/Vector2.js';

export default class Camera {
  constructor({ viewportWidth = 0, viewportHeight = 0, lerpSpeed = 6 } = {}) {
    this.position = new Vector2();
    this.target = new Vector2();
    this.viewport = new Vector2(viewportWidth, viewportHeight);
    this.lerpSpeed = lerpSpeed; // how fast we approach target per second
    this.worldSize = { width: viewportWidth, height: viewportHeight };
  }

  setViewport(width, height) {
    this.viewport.set(width, height);
  }

  setWorldSize(width, height) {
    this.worldSize.width = width;
    this.worldSize.height = height;
  }

  setTarget(x, y) {
    this.target.set(x, y);
  }

  update(deltaSeconds) {
    // Smoothly approach target
    const t = 1 - Math.exp(-this.lerpSpeed * deltaSeconds);
    this.position.x += (this.target.x - this.position.x) * t;
    this.position.y += (this.target.y - this.position.y) * t;

    // Clamp to world bounds (assuming world dimensions >= viewport)
    const maxX = Math.max(0, this.worldSize.width - this.viewport.x);
    const maxY = Math.max(0, this.worldSize.height - this.viewport.y);
    this.position.x = Math.min(Math.max(this.position.x, 0), maxX);
    this.position.y = Math.min(Math.max(this.position.y, 0), maxY);
  }
}
