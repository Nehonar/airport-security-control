import { CLOCK_MINUTES_PER_SECOND, CLOCK_MULTIPLIER, TimeMode } from '../utils/Constants.js';

export default class GameClock {
  constructor({ startHour = 9, startMinute = 0, mode = TimeMode.NORMAL } = {}) {
    this.totalMinutes = startHour * 60 + startMinute;
    this.mode = mode;
  }

  setMode(mode) {
    if (mode && this.mode !== mode) {
      this.mode = mode;
    }
  }

  update(deltaSeconds) {
    const multiplier = CLOCK_MULTIPLIER[this.mode] ?? 1;
    const minutesToAdd = deltaSeconds * CLOCK_MINUTES_PER_SECOND * multiplier;
    this.totalMinutes = (this.totalMinutes + minutesToAdd) % (24 * 60);
  }

  getSnapshot() {
    const hours = Math.floor(this.totalMinutes / 60) % 24;
    const minutes = Math.floor(this.totalMinutes % 60);
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const multiplier = CLOCK_MULTIPLIER[this.mode] ?? 1;
    return {
      time: `${hh}:${mm}`,
      mode: this.mode,
      multiplier,
    };
  }
}
