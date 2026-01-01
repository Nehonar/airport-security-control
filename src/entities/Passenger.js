export default class Passenger {
  constructor({ id, name, flightId, isValid = null, invalidReason = undefined, decision = undefined, outcome = undefined }) {
    this.id = id;
    this.name = name;
    this.flightId = flightId;
    this.isValid = isValid;
    this.invalidReason = invalidReason;
    this.decision = decision;
    this.outcome = outcome;
  }
}
