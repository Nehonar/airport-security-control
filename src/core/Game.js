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
      elapsedMs: 0,
      durationMs: GAME_DURATION_MS,
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

  update(deltaSeconds) {
    const deltaMs = deltaSeconds * 1000;
    this.state.elapsedMs = Math.min(
      this.state.elapsedMs + deltaMs,
      this.state.durationMs,
    );
  }

  render() {
    this.renderer.render(this.state);
  }
}
