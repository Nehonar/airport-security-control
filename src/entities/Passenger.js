import Vector2 from '../utils/Vector2.js';

export default class Passenger {
  constructor({
    id,
    name,
    flightId,
    isValid = null,
    invalidReason = undefined,
    decision = undefined,
    outcome = undefined,
    position = new Vector2(),
  }) {
    this.id = id;
    this.name = name;
    this.flightId = flightId;
    this.isValid = isValid;
    this.invalidReason = invalidReason;
    this.decision = decision;
    this.outcome = outcome;
    this.position = position instanceof Vector2 ? position : new Vector2(position.x, position.y);
    this.assignedSlot = null;
  }
}
