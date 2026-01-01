import Vector2 from '../utils/Vector2.js';

export default class QueueSlot {
  constructor({ id, position }) {
    this.id = id;
    this.position = position instanceof Vector2 ? position : new Vector2(position.x, position.y);
    this.occupiedBy = null; // Passenger or null
  }

  isFree() {
    return this.occupiedBy === null;
  }

  occupy(passenger) {
    if (!this.isFree()) return false;
    this.occupiedBy = passenger;
    if (passenger) passenger.assignedSlot = this;
    return true;
  }

  release() {
    if (this.occupiedBy) {
      this.occupiedBy.assignedSlot = null;
    }
    this.occupiedBy = null;
  }
}
