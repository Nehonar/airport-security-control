import GameLoop from './GameLoop.js';
import Time from './Time.js';
import Renderer from '../render/Renderer.js';
import { GAME_DURATION_MS, CAMERA_LERP_SPEED } from '../utils/Constants.js';
import Player from '../entities/Player.js';
import Vector2 from '../utils/Vector2.js';
import InputSystem from '../systems/InputSystem.js';
import MovementSystem from '../systems/MovementSystem.js';
import Zone from '../zones/Zone.js';
import ZoneManager from '../zones/ZoneManager.js';
import Camera from '../camera/Camera.js';

export default class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.time = new Time();
    this.renderer = new Renderer(canvas);
    this.inputSystem = new InputSystem();
    this.movementSystem = new MovementSystem();
    this.zoneManager = new ZoneManager();
    this.camera = new Camera({
      viewportWidth: this.canvas.width,
      viewportHeight: this.canvas.height,
      lerpSpeed: CAMERA_LERP_SPEED,
    });
    this.createZones();
    this.player = this.createPlayer();

    this.state = {
      elapsedMs: 0,
      durationMs: GAME_DURATION_MS,
      player: this.player,
      zones: this.zoneManager.zones,
      activeZoneId: this.zoneManager.activeZone?.id ?? null,
      camera: this.camera,
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

  createPlayer() {
    const player = new Player();
    // Posiciona al jugador centrado en la primera zona.
    const zoneWidth = this.canvas.width / 3;
    player.position.set(zoneWidth / 2 - player.size.x / 2, this.canvas.height / 2 - player.size.y / 2);
    return player;
  }

  createZones() {
    const zoneWidth = this.canvas.width;
    const zoneHeight = this.canvas.height;
    const zoneNames = [
      'Control de documentos',
      'Arcos y bandejas',
      'Recogida de bandejas',
    ];

    zoneNames.forEach((name, index) => {
      const zone = new Zone({
        id: `zone-${index + 1}`,
        name,
        bounds: {
          x: 0,
          y: index * zoneHeight,
          width: zoneWidth,
          height: zoneHeight,
        },
      });
      this.zoneManager.addZone(zone);
    });

    // World size equals union of zones.
    this.worldSize = {
      width: zoneWidth,
      height: zoneHeight * zoneNames.length,
    };
    this.camera.setWorldSize(this.worldSize.width, this.worldSize.height);
    this.camera.setViewport(this.canvas.width, this.canvas.height);
    this.updateCameraTarget(this.zoneManager.activeZone ?? this.zoneManager.zones[0]);
  }

  update(deltaSeconds) {
    const deltaMs = deltaSeconds * 1000;
    this.state.elapsedMs = Math.min(
      this.state.elapsedMs + deltaMs,
      this.state.durationMs,
    );

    this.inputSystem.update();
    this.movementSystem.update({
      player: this.player,
      input: this.inputSystem,
      deltaSeconds,
      bounds: { width: this.worldSize.width, height: this.worldSize.height },
    });

    this.zoneManager.update(this.player);
    this.state.activeZoneId = this.zoneManager.activeZone?.id ?? null;
    if (this.zoneManager.activeZone) {
      this.updateCameraTarget(this.zoneManager.activeZone);
    }
    this.camera.update(deltaSeconds);
  }

  render() {
    this.renderer.render(this.state);
  }

  updateCameraTarget(zone) {
    if (!zone) return;
    // Anchor camera to center of the zone.
    const zoneCenterX = zone.bounds.x + zone.bounds.width / 2;
    const zoneCenterY = zone.bounds.y + zone.bounds.height / 2;
    const targetX = zoneCenterX - this.canvas.width / 2;
    const targetY = zoneCenterY - this.canvas.height / 2;
    this.camera.setTarget(targetX, targetY);
  }
}
