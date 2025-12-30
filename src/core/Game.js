import GameLoop from './GameLoop.js';
import Time from './Time.js';
import Renderer from '../render/Renderer.js';
import { GAME_DURATION_MS } from '../utils/Constants.js';

export default class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.time = new Time();
    this.renderer = new Renderer(canvas);

    this.state = {
      elapsed: 0,
      duration: GAME_DURATION_MS,
    };

    this.loop = new GameLoop({
      update: this.update.bind(this),
      render: this.render.bind(this),
      time: this.time,
    });
  }

  start() {
    this.loop.start();
  }

  stop() {
    this.loop.stop();
  }

  update(delta) {
    this.state.elapsed = Math.min(this.state.elapsed + delta, this.state.duration);
  }

  render() {
    this.renderer.render(this.state);
  }
}
