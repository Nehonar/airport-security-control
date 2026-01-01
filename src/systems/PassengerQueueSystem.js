import Passenger from '../entities/Passenger.js';
import BoardingPass from '../entities/BoardingPass.js';
import Passport from '../entities/Passport.js';
import Vector2 from '../utils/Vector2.js';

const NAMES = [
  'Ana Torres',
  'Luis García',
  'María López',
  'Carlos Ruiz',
  'Elena Martín',
  'Javier Díaz',
  'Laura Gómez',
  'Sergio Pérez',
  'Carmen Ortiz',
  'Pablo Sánchez',
];

export default class PassengerQueueSystem {
  constructor({
    flights,
    queueSize = 5,
    maxSize = null,
    spawnPosition = new Vector2(),
  }) {
    this.flights = flights;
    this.queueSize = queueSize;
    this.maxSize = maxSize ?? queueSize;
    this.spawnPosition = spawnPosition instanceof Vector2 ? spawnPosition : new Vector2(spawnPosition.x, spawnPosition.y);
    this.queue = [];
    this.generatedCount = 0;
  }

  update() {}

  createPassengerEntry() {
    const flight = this.pickFlight();
    const baseName = this.pickName();
    const id = `passenger-${++this.generatedCount}`;

    const passenger = new Passenger({
      id,
      name: baseName,
      flightId: flight?.id ?? 'UNKNOWN',
      position: this.spawnPosition.copy(),
    });

    // By default documents match passenger.
    let boardingName = baseName;
    let boardingFlightId = passenger.flightId;
    let passportName = baseName;

    // Introduce inconsistencies with small probability.
    if (Math.random() < 0.2) {
      // 20% chance of wrong flight on boarding pass.
      boardingFlightId = this.pickWrongFlightId(flight);
    }
    if (Math.random() < 0.15) {
      // 15% chance of name mismatch between passport and boarding pass.
      passportName = this.pickDifferentName(baseName);
    }

    const boardingPass = new BoardingPass({
      passengerName: boardingName,
      flightId: boardingFlightId,
    });

    const passport = new Passport({
      passengerName: passportName,
    });

    return {
      passenger,
      boardingPass,
      passport,
    };
  }

  pickFlight() {
    if (!this.flights || this.flights.length === 0) return null;
    return this.flights[Math.floor(Math.random() * this.flights.length)];
  }

  pickWrongFlightId(currentFlight) {
    if (!this.flights || this.flights.length === 0) return 'UNKNOWN';
    const otherFlights = this.flights.filter((f) => f !== currentFlight);
    if (otherFlights.length === 0) return 'UNKNOWN';
    return otherFlights[Math.floor(Math.random() * otherFlights.length)].id;
  }

  pickName() {
    return NAMES[Math.floor(Math.random() * NAMES.length)];
  }

  pickDifferentName(currentName) {
    const alternatives = NAMES.filter((name) => name !== currentName);
    if (alternatives.length === 0) return currentName;
    return alternatives[Math.floor(Math.random() * alternatives.length)];
  }

  peek() {
    return this.queue[0] ?? null;
  }

  pop() {
    const passenger = this.queue.shift() ?? null;
    return passenger;
  }
}
