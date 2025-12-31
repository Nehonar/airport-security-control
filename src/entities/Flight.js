export const FlightStatus = {
  SCHEDULED: 'SCHEDULED',
  BOARDING: 'BOARDING',
  LAST_CALL: 'LAST_CALL',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  DELAYED: 'DELAYED',
};

export default class Flight {
  constructor({
    id,
    code,
    destination,
    departureTime,
    departureMinutes,
    scheduledDepartureMinutes = departureMinutes,
    status = FlightStatus.SCHEDULED,
  }) {
    this.id = id;
    this.code = code;
    this.destination = destination;
    this.departureTime = departureTime; // HH:MM string for now
    this.departureMinutes = departureMinutes; // actual departure (may be delayed)
    this.scheduledDepartureMinutes = scheduledDepartureMinutes;
    this.status = status;
    this.isDelayed = false;
  }

  setStatus(status) {
    this.status = status;
  }

  delay(newDepartureMinutes) {
    this.departureMinutes = newDepartureMinutes;
    this.isDelayed = newDepartureMinutes !== this.scheduledDepartureMinutes;
  }
}
