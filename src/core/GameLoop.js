export default class GameLoop {
  constructor({ update, render, time }) {
    this.update = update;
    this.render = render;
    this.time = time;
    this.running = false;
    this.frameRequest = null;
    this.step = this.step.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.frameRequest = requestAnimationFrame(this.step);
  }

  stop() {
    this.running = false;
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
      this.frameRequest = null;
    }
  }

  step(timestamp) {
    if (!this.running) return;

    const delta = this.time.update(timestamp);
    this.update(delta);
    this.render();

    this.frameRequest = requestAnimationFrame(this.step);
  }
}
