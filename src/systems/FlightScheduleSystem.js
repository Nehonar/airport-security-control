import Flight, { FlightStatus } from '../entities/Flight.js';
import { BOARDING_WINDOW_MINUTES, LAST_CALL_WINDOW_MINUTES } from '../utils/Constants.js';

const DESTINATIONS = ['MAD', 'BCN', 'LHR', 'CDG', 'JFK', 'FRA', 'AMS'];

export default class FlightScheduleSystem {
  constructor({ flights = null, clockStartMinutes = 0, flightCount = 6, spacingMinutes = 15 } = {}) {
    this.clockStartMinutes = clockStartMinutes;
    this.flightCount = flightCount;
    this.spacingMinutes = spacingMinutes;
    this.flights = flights ?? this.createInitialFlights();
    this.logFlights('Inicial');
  }

  createInitialFlights() {
    const flights = [];
    for (let i = 0; i < this.flightCount; i += 1) {
      const depMinutes = this.clockStartMinutes + (i + 1) * this.spacingMinutes;
      const departureTime = this.minutesToHHMM(depMinutes);
      flights.push(
        new Flight({
          id: `flight-${i + 1}`,
          code: `AS${100 + i}`,
          destination: DESTINATIONS[i % DESTINATIONS.length],
          departureTime,
          departureMinutes: depMinutes,
          scheduledDepartureMinutes: depMinutes,
          status: FlightStatus.SCHEDULED,
        }),
      );
    }
    return flights;
  }

  update(deltaSeconds, clockMinutes) {
    this.flights.forEach((flight) => {
      this.updateFlight(flight, clockMinutes);
    });
  }

  updateFlight(flight, clockMinutes) {
    if (flight.status === FlightStatus.CANCELLED) return;
    const nextStatus = this.deriveStatus(flight, clockMinutes);
    this.setStatus(flight, nextStatus);
  }

  deriveStatus(flight, clockMinutes) {
    const minutesUntilDeparture = flight.departureMinutes - clockMinutes;

    if (minutesUntilDeparture <= 0) return FlightStatus.CLOSED;

    if (minutesUntilDeparture <= LAST_CALL_WINDOW_MINUTES) return FlightStatus.LAST_CALL;
    if (minutesUntilDeparture <= BOARDING_WINDOW_MINUTES) return FlightStatus.BOARDING;

    // If departure was delayed (departureMinutes moved) mark delayed, otherwise scheduled.
    if (flight.isDelayed) return FlightStatus.DELAYED;
    return FlightStatus.SCHEDULED;
  }

  setStatus(flight, status) {
    if (flight.status === status) return;
    flight.setStatus(status);
    this.logStatusChange(flight);
  }

  logFlights(prefix = 'Flights') {
    console.info(`[${prefix}] Lista de vuelos:`);
    console.table(
      this.flights.map((f) => ({
        id: f.id,
        code: f.code,
        destination: f.destination,
        departure: f.departureTime,
        status: f.status,
      })),
    );
  }

  logStatusChange(flight) {
    console.info(
      `[FlightStatus] ${flight.code} -> ${flight.status} (dest: ${flight.destination}, dep: ${flight.departureTime})`,
    );
  }

  minutesToHHMM(totalMinutes) {
    const minutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(Math.floor(minutes % 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
