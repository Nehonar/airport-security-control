import { TimeMode } from '../utils/Constants.js';
import { InvalidReason } from '../entities/InvalidReason.js';
import { InspectionDecision } from '../entities/InspectionDecision.js';

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
    const { passenger, boardingPass } = passengerEntry;
    const evaluation = this.evaluateValidity(passengerEntry, flights);
    const decision = evaluation.isValid ? InspectionDecision.ACCEPTED : InspectionDecision.REJECTED;
    // Marca decisión del jugador (aunque sea incorrecta respecto a validez real).
    passenger.decision = decision;

    this.lastResult = {
      decision,
      passengerName: passenger.name,
      flightCode: evaluation.flightCode,
      reason: evaluation.reasonText,
    };

    console.info(`[Inspection] ${decision} - ${passenger.name} (${evaluation.reasonText})`);
    return this.lastResult;
  }

  evaluateValidity(passengerEntry, flights) {
    const { passenger, boardingPass, passport } = passengerEntry;
    const flight = flights?.find((f) => f.id === boardingPass.flightId);

    let isValid = true;
    let invalidReason = undefined;

    if (!flight) {
      isValid = false;
      invalidReason = InvalidReason.FLIGHT_NOT_FOUND;
    } else if (flight.status === 'CLOSED') {
      isValid = false;
      invalidReason = InvalidReason.FLIGHT_CLOSED;
    } else if (flight.status === 'CANCELLED') {
      isValid = false;
      invalidReason = InvalidReason.FLIGHT_CANCELLED;
    } else if (boardingPass.passengerName !== passport.passengerName) {
      isValid = false;
      invalidReason = InvalidReason.NAME_MISMATCH;
    }

    passenger.isValid = isValid;
    passenger.invalidReason = invalidReason;

    const reasonText = (() => {
      if (isValid) return 'OK';
      switch (invalidReason) {
        case InvalidReason.FLIGHT_NOT_FOUND:
          return 'Vuelo no existe';
        case InvalidReason.FLIGHT_CLOSED:
          return 'Vuelo CLOSED';
        case InvalidReason.FLIGHT_CANCELLED:
          return 'Vuelo CANCELLED';
        case InvalidReason.NAME_MISMATCH:
          return 'Nombre no coincide';
        default:
          return 'Inválido';
      }
    })();

    return {
      isValid,
      invalidReason,
      flightCode: flight?.code ?? boardingPass.flightId,
      reasonText,
    };
  }
}
