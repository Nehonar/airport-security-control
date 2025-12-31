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
};

export default class InputSystem {
  constructor(target = window) {
    this.active = true;
    this.direction = new Vector2(0, 0);
    this.keys = new Set();
    this.target = target;

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

    this.target.addEventListener('keydown', this.onKeyDown);
    this.target.addEventListener('keyup', this.onKeyUp);
  }

  onKeyDown(event) {
    const dir = KEY_MAP[event.code];
    if (!dir) return;
    this.keys.add(dir);
    event.preventDefault();
  }

  onKeyUp(event) {
    const dir = KEY_MAP[event.code];
    if (!dir) return;
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
}
