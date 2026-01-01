import Vector2 from '../utils/Vector2.js';

const KEY_MAP = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyW: 'up',
  KeyS: 'down',
  KeyA: 'left',
  KeyD: 'right',
  KeyE: 'interact',
  Space: 'interact',
  Enter: 'interact',
  Escape: 'cancel',
  KeyF: 'accept',
  KeyR: 'reject',
  KeyQ: 'toggleQueueDebug',
};

export default class InputSystem {
  constructor(target = window) {
    this.active = true;
    this.direction = new Vector2(0, 0);
    this.keys = new Set();
    this.target = target;
    this.interactRequested = false;
    this.cancelRequested = false;
    this.acceptRequested = false;
    this.rejectRequested = false;
    this.toggleQueueDebugRequested = false;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(event) {
    const dir = KEY_MAP[event.code];
    if (!dir) return;
    if (dir === 'interact') {
      this.interactRequested = true;
    } else if (dir === 'cancel') {
      this.cancelRequested = true;
    } else if (dir === 'accept') {
      this.acceptRequested = true;
    } else if (dir === 'reject') {
      this.rejectRequested = true;
    } else if (dir === 'toggleQueueDebug') {
      this.toggleQueueDebugRequested = true;
    } else {
      this.keys.add(dir);
    }
    event.preventDefault();
  }

  onKeyUp(event) {
    const dir = KEY_MAP[event.code];
    if (!dir) return;
    if (dir === 'interact' || dir === 'cancel' || dir === 'accept' || dir === 'reject') return;
    this.keys.delete(dir);
    event.preventDefault();
  }

  update() {
    if (!this.active) return;

    let x = 0;
    let y = 0;
    if (this.keys.has('left')) x -= 1;
    if (this.keys.has('right')) x += 1;
    if (this.keys.has('up')) y -= 1;
    if (this.keys.has('down')) y += 1;

    const length = Math.hypot(x, y);
    if (length > 0) {
      this.direction.set(x / length, y / length);
    } else {
      this.direction.set(0, 0);
    }
  }

  consumeInteract() {
    if (this.interactRequested) {
      this.interactRequested = false;
      return true;
    }
    return false;
  }

  consumeCancel() {
    if (this.cancelRequested) {
      this.cancelRequested = false;
      return true;
    }
    return false;
  }

  consumeAccept() {
    if (this.acceptRequested) {
      this.acceptRequested = false;
      return true;
    }
    return false;
  }

  consumeReject() {
    if (this.rejectRequested) {
      this.rejectRequested = false;
      return true;
    }
    return false;
  }

  consumeToggleQueueDebug() {
    if (this.toggleQueueDebugRequested) {
      this.toggleQueueDebugRequested = false;
      return true;
    }
    return false;
  }
}
