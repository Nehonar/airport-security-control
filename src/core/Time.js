export default class Time {
  constructor({ maxDeltaMs = 100 } = {}) {
    this.maxDeltaMs = maxDeltaMs;
    this.lastTimestamp = 0;
    this.deltaMs = 0;
    this.elapsedMs = 0;
    this.started = false;
  }

  update(timestamp) {
    if (!this.started) {
      this.started = true;
      this.lastTimestamp = timestamp;
      this.deltaMs = 0;
      return this.deltaMs;
    }

    const rawDelta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.deltaMs = Math.min(rawDelta, this.maxDeltaMs);
    this.elapsedMs += this.deltaMs;
    return this.deltaMs;
  }

  get deltaSeconds() {
    return this.deltaMs / 1000;
  }

  get elapsedSeconds() {
    return this.elapsedMs / 1000;
  }
}
