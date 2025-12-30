export default class Time {
  constructor() {
    this.lastTimestamp = 0;
    this.delta = 0;
    this.elapsed = 0;
    this.started = false;
  }

  update(timestamp) {
    if (!this.started) {
      this.started = true;
      this.lastTimestamp = timestamp;
      this.delta = 0;
      return this.delta;
    }

    this.delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    this.elapsed += this.delta;
    return this.delta;
  }
}
