export default class PassengerQueue {
  constructor(slots = []) {
    this.slots = slots;
  }

  // Enqueue to first free slot from back (end) of the queue.
  enqueue(passenger) {
    const target = [...this.slots].reverse().find((slot) => slot.isFree());
    if (!target) return false;
    target.occupy(passenger);
    return true;
  }

  // Peek passenger at the front (slot 0).
  peek() {
    return this.slots.find((slot) => !slot.isFree())?.occupiedBy ?? null;
  }

  // Advance: remove from front, shift passengers forward one slot if free.
  advance() {
    // Release front if occupied.
    const first = this.slots[0];
    let released = null;
    if (first && !first.isFree()) {
      released = first.occupiedBy;
      first.release();
    }
    // Shift forward
    for (let i = 1; i < this.slots.length; i += 1) {
      const slot = this.slots[i];
      if (!slot.isFree() && this.slots[i - 1].isFree()) {
        this.slots[i - 1].occupy(slot.occupiedBy);
        slot.release();
      }
    }
    return released;
  }

  clear() {
    this.slots.forEach((slot) => slot.release());
  }

  occupiedCount() {
    return this.slots.filter((s) => !s.isFree()).length;
  }
}
