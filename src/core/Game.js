import GameLoop from './GameLoop.js';
import Time from './Time.js';
import Renderer from '../render/Renderer.js';
import { GAME_DURATION_MS, CAMERA_LERP_SPEED, TimeMode, GAME_START_HOUR, GAME_START_MINUTE } from '../utils/Constants.js';
import Player from '../entities/Player.js';
import Vector2 from '../utils/Vector2.js';
import InputSystem from '../systems/InputSystem.js';
import MovementSystem from '../systems/MovementSystem.js';
import Zone from '../zones/Zone.js';
import ZoneManager from '../zones/ZoneManager.js';
import Camera from '../camera/Camera.js';
import GameClock from './GameClock.js';
import FlightScheduleSystem from '../systems/FlightScheduleSystem.js';
import FlightPanel from '../render/FlightPanel.js';
import PassengerQueueSystem from '../systems/PassengerQueueSystem.js';
import InteractionSystem from '../systems/InteractionSystem.js';
import InspectionSystem from '../systems/InspectionSystem.js';
import InspectionOverlay from '../render/InspectionOverlay.js';
import SupervisorSystem from '../systems/SupervisorSystem.js';
import SupervisorOverlay from '../render/SupervisorOverlay.js';
import ControlsOverlay from '../render/ControlsOverlay.js';
import supervisorRules from '../../config/supervisorRules.js';

export default class Game {
  constructor({ canvas }) {
    this.canvas = canvas;
    this.time = new Time();
    this.renderer = new Renderer(canvas);
    this.inputSystem = new InputSystem();
    this.movementSystem = new MovementSystem();
    this.gameClock = new GameClock({ startHour: GAME_START_HOUR, startMinute: GAME_START_MINUTE });
    this.zoneManager = new ZoneManager();
    this.flightScheduleSystem = new FlightScheduleSystem({
      clockStartMinutes: this.gameClock.totalMinutes,
    });
    this.interactionMode = TimeMode.NORMAL;
    this.flightPanel = new FlightPanel(document.body);
    this.passengerQueueSystem = new PassengerQueueSystem({
      flights: this.flightScheduleSystem.flights,
    });
    this.interactionSystem = new InteractionSystem({
      area: this.createInteractionArea(),
    });
    this.inspectionSystem = new InspectionSystem();
    this.inspectionOverlay = new InspectionOverlay(document.body);
    this.supervisorSystem = new SupervisorSystem(supervisorRules);
    this.supervisorOverlay = new SupervisorOverlay(document.body);
    this.controlsOverlay = new ControlsOverlay(document.body);
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
      flights: this.flightScheduleSystem.flights,
      clock: this.gameClock.getSnapshot(),
      interactionMode: this.interactionMode,
      passengers: this.passengerQueueSystem.queue,
      currentPassenger: this.passengerQueueSystem.peek(),
      interactionArea: this.interactionSystem.area,
      canInspect: this.interactionSystem.canInspect,
      inspectionActive: this.inspectionSystem.active,
      inspectionResult: null,
      supervisorMessages: [],
      metrics: {
        entryQueueLength: this.passengerQueueSystem.queue.length,
        availableTrays: 6,
        backendTrayCount: 0,
        timeAwayFromInspection: 0,
        timeInInspection: 0,
      },
    };
    this.timeAwayFromInspectionMs = 0;
    this.timeInInspectionMs = 0;

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
    const zoneWidth = this.canvas.width;
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

    this.flightScheduleSystem.update(deltaSeconds, this.gameClock.totalMinutes);
    this.passengerQueueSystem.update();
    this.gameClock.setMode(this.interactionMode);
    this.gameClock.update(deltaSeconds);
    this.state.clock = this.gameClock.getSnapshot();
    this.state.passengers = this.passengerQueueSystem.queue;
    this.state.currentPassenger = this.passengerQueueSystem.peek();
    this.inputSystem.update();
    this.handleInteraction();
    if (this.inspectionSystem.active) {
      this.handleInspectionDecision();
    }
    if (!this.inspectionSystem.active) {
      this.movementSystem.update({
        player: this.player,
        input: this.inputSystem,
        deltaSeconds,
        bounds: { width: this.worldSize.width, height: this.worldSize.height },
      });
    }

    this.zoneManager.update(this.player);
    this.state.activeZoneId = this.zoneManager.activeZone?.id ?? null;
    if (this.zoneManager.activeZone) {
      this.updateCameraTarget(this.zoneManager.activeZone);
    }
    this.camera.update(deltaSeconds);

    this.interactionSystem.update(this.player);
    this.state.canInspect = this.interactionSystem.canInspect;
    this.state.inspectionActive = this.inspectionSystem.active;

    this.updateInspectionTimers(deltaMs);
    this.updateMetrics();
    this.supervisorSystem.update(deltaSeconds, this.state.metrics);
    this.state.supervisorMessages = this.supervisorSystem.messages;
  }

  render() {
    this.renderer.render(this.state);
    this.flightPanel.render(this.state);
    this.inspectionOverlay.render(this.state);
    this.supervisorOverlay.render(this.state.supervisorMessages);
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

  setInteractionMode(mode) {
    this.interactionMode = mode ?? TimeMode.NORMAL;
    this.state.interactionMode = this.interactionMode;
  }

  createInteractionArea() {
    // Define el puesto de inspección en la Zona 1, centrado horizontal y en la parte superior.
    const width = 180;
    const height = 120;
    const x = this.canvas.width / 2 - width / 2;
    const y = 120; // dentro de la primera zona (y=0)
    return { x, y, width, height };
  }

  handleInteraction() {
    const wantsInteract = this.inputSystem.consumeInteract();
    const wantsCancel = this.inputSystem.consumeCancel();

    if (!this.inspectionSystem.active && wantsInteract && this.interactionSystem.canInspect) {
      this.enterInspectionMode();
      return;
    }

    if (this.inspectionSystem.active && wantsCancel) {
      this.exitInspectionMode();
    }
  }

  enterInspectionMode() {
    const mode = this.inspectionSystem.enter();
    this.setInteractionMode(mode);
  }

  exitInspectionMode() {
    const mode = this.inspectionSystem.exit();
    this.setInteractionMode(mode);
    this.state.inspectionResult = this.inspectionSystem.lastResult;
  }

  handleInspectionDecision() {
    const wantsAccept = this.inputSystem.consumeAccept();
    const wantsReject = this.inputSystem.consumeReject();
    const wantsCancel = this.inputSystem.consumeCancel();

    if (!this.inspectionSystem.active) return;

    const currentPassenger = this.passengerQueueSystem.peek();
    if (!currentPassenger) {
      this.exitInspectionMode();
      return;
    }

    if (wantsAccept || wantsReject) {
      const decision = wantsReject ? 'REJECTED' : 'ACCEPTED';
      let result = null;
      if (decision === 'ACCEPTED') {
        result = this.inspectionSystem.decide({
          passengerEntry: currentPassenger,
          flights: this.flightScheduleSystem.flights,
        });
      } else {
        result = {
          decision: 'REJECTED',
          passengerName: currentPassenger.passenger.name,
          flightCode: currentPassenger.boardingPass.flightId,
          reason: 'Rechazado manualmente',
        };
        this.inspectionSystem.lastResult = result;
        console.info(`[Inspection] REJECTED - ${result.passengerName} (${result.reason})`);
      }

      this.passengerQueueSystem.pop();
      this.state.passengers = this.passengerQueueSystem.queue;
      this.state.currentPassenger = this.passengerQueueSystem.peek();
      this.state.inspectionResult = result;
      return;
    }

    if (wantsCancel) {
      this.exitInspectionMode();
    }
  }

  updateInspectionTimers(deltaMs) {
    const atControl = this.interactionSystem.canInspect || this.inspectionSystem.active;
    if (this.inspectionSystem.active) {
      this.timeInInspectionMs += deltaMs;
    } else {
      this.timeInInspectionMs = 0;
    }

    if (atControl) {
      this.timeAwayFromInspectionMs = 0;
    } else {
      this.timeAwayFromInspectionMs += deltaMs;
    }
  }

  updateMetrics() {
    this.state.metrics = {
      ...this.state.metrics,
      entryQueueLength: this.passengerQueueSystem.queue.length,
      timeAwayFromInspection: this.timeAwayFromInspectionMs,
      timeInInspection: this.timeInInspectionMs,
    };
    // Bandejas son dummy en esta fase.
  }
}
