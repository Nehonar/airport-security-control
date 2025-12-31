import { TimeMode } from '../utils/Constants.js';

export default class InspectionSystem {
  constructor() {
    this.active = false;
    this.lastResult = null;
  }

  enter() {
    if (this.active) return;
    this.active = true;
    console.info('[Inspection] Modo inspección ACTIVADO');
    return TimeMode.DOCUMENT_INSPECTION;
  }

  exit() {
    if (!this.active) return TimeMode.NORMAL;
    this.active = false;
    console.info('[Inspection] Modo inspección DESACTIVADO');
    this.lastResult = null;
    return TimeMode.NORMAL;
  }

  decide({ passengerEntry, flights }) {
    if (!this.active || !passengerEntry) return null;
    const { passenger, boardingPass, passport } = passengerEntry;
    const flight = flights?.find((f) => f.id === boardingPass.flightId);

    const namesMatch = boardingPass.passengerName === passport.passengerName;
    const flightValid =
      !!flight &&
      flight.status !== 'CLOSED' &&
      flight.status !== 'CANCELLED';

    const decision =
      flightValid && namesMatch
        ? 'ACCEPTED'
        : 'REJECTED';

    const reason = (() => {
      if (!flight) return 'Vuelo no existe';
      if (flight.status === 'CLOSED' || flight.status === 'CANCELLED') return `Vuelo ${flight.status}`;
      if (!namesMatch) return 'Nombre no coincide';
      return 'OK';
    })();

    this.lastResult = {
      decision,
      passengerName: passenger.name,
      flightCode: flight?.code ?? boardingPass.flightId,
      reason,
    };

    console.info(`[Inspection] ${decision} - ${passenger.name} (${reason})`);
    return this.lastResult;
  }
}
