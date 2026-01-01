export default class PassengerArrivalSystem {
  constructor({
    spawnPosition,
    minEventIntervalMs = 500,
    maxEventIntervalMs = 3000,
    groupMin = 1,
    groupMax = 4,
    intraMinMs = 200,
    intraMaxMs = 500,
  }) {
    this.spawnPosition = spawnPosition;
    this.minEventIntervalMs = minEventIntervalMs;
    this.maxEventIntervalMs = maxEventIntervalMs;
    this.groupMin = groupMin;
    this.groupMax = groupMax;
    this.intraMinMs = intraMinMs;
    this.intraMaxMs = intraMaxMs;

    this.timeToNextEvent = this.randomInRange(this.minEventIntervalMs, this.maxEventIntervalMs);
    this.currentGroupRemaining = 0;
    this.timeToNextPassenger = 0;
  }

  update({ deltaMs, queueSystem, slots }) {
    if (!queueSystem || !slots || slots.length === 0) return;

    if (this.currentGroupRemaining > 0) {
      this.timeToNextPassenger -= deltaMs;
      if (this.timeToNextPassenger <= 0) {
        if (this.trySpawnOne(queueSystem, slots)) {
          this.currentGroupRemaining -= 1;
          this.timeToNextPassenger = this.randomInRange(this.intraMinMs, this.intraMaxMs);
        } else {
          // No espacio: reintenta pronto sin consumir el grupo.
          this.timeToNextPassenger = 300;
        }
      }
      return;
    }

    this.timeToNextEvent -= deltaMs;
    if (this.timeToNextEvent <= 0) {
      const freeSlots = this.countFreeSlots(slots);
      if (freeSlots === 0) {
        this.timeToNextEvent = 500; // reintenta pronto
        return;
      }
      const groupSize = Math.min(
        freeSlots,
        this.randomInt(this.groupMin, this.groupMax),
      );
      this.currentGroupRemaining = groupSize;
      this.timeToNextPassenger = 0; // disparar inmediatamente el primero
      this.timeToNextEvent = this.randomInRange(this.minEventIntervalMs, this.maxEventIntervalMs);
    }
  }

  trySpawnOne(queueSystem, slots) {
    const lastFree = this.findLastFreeSlot(slots);
    if (!lastFree) return false;
    const entry = queueSystem.createPassengerEntry();
    queueSystem.queue.push(entry);
    lastFree.occupy(entry.passenger);
    // Coloca al pasajero directamente en el slot de cola para evitar "vuelos" desde el spawn.
    entry.passenger.position.set(lastFree.position.x, lastFree.position.y);
    return true;
  }

  findLastFreeSlot(slots) {
    for (let i = slots.length - 1; i >= 0; i -= 1) {
      if (slots[i].isFree()) return slots[i];
    }
    return null;
  }

  countFreeSlots(slots) {
    return slots.reduce((acc, s) => (s.isFree() ? acc + 1 : acc), 0);
  }

  randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  randomInt(min, max) {
    return Math.floor(this.randomInRange(min, max + 1));
  }
}
