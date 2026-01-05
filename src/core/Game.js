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
import { zigZagZona1 } from '../../config/checkpoints.js';

const CONFIG_LIDER = {
  radioDeteccion: 5,
  radioDisolucion: 30,
  minClusters: 2,
  maxClusters: 10,
  distanciaEspera: 20,
};

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
    this.passengerQueueSystem = new PassengerQueueSystem({
      flights: this.flightScheduleSystem.flights,
      queueSize: 0,
      maxSize: 0,
      spawnPosition: new Vector2(),
      spawnIntervalMs: 0,
    });
    this.passengerDocs = new Map(); // passengerId -> {passenger, boardingPass, passport}
    this.interactionMode = TimeMode.NORMAL;
    this.flightPanel = new FlightPanel(document.body);
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
    this.checkpoints = this.createCheckpoints();
    this.finalCheckpointIndex = this.checkpoints.findIndex((cp) => cp.name === 'ZZ-Final');
    this.waitingFinalQueue = [];
    this.activePassengers = [];
    this.spawnTestPassengers(5);

    this.state = {
      elapsedMs: 0,
      durationMs: GAME_DURATION_MS,
      player: this.player,
      activePassengers: [],
      zones: this.zoneManager.zones,
      activeZoneId: this.zoneManager.activeZone?.id ?? null,
      camera: this.camera,
      flights: this.flightScheduleSystem.flights,
      clock: this.gameClock.getSnapshot(),
      interactionMode: this.interactionMode,
      passengers: this.activePassengers,
      currentPassenger: this.activePassengers[0] ?? null,
      interactionArea: this.interactionSystem.area,
      canInspect: this.interactionSystem.canInspect,
      inspectionActive: this.inspectionSystem.active,
      inspectionResult: null,
      supervisorMessages: [],
      metrics: {
        entryQueueLength: 0,
        availableTrays: 6,
        backendTrayCount: 0,
        timeAwayFromInspection: 0,
        timeInInspection: 0,
      },
      queueSlots: [],
      debugQueue: false,
      checkpoints: this.checkpoints,
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
    const zoneWidth = this.canvas.width;
    player.position.set(zoneWidth / 2 - player.size.x / 2, this.canvas.height / 2 - player.size.y / 2);
    return player;
  }

  createCheckpoints() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const spawn = [{ x: w / 2, y: -80, name: 'Spawn' }]; // Zona 0 (fuera de cámara)
    const zigzag = zigZagZona1.map((cp) => ({ ...cp, enabled: cp.enabled ?? true }));
    const zona2 = [{ x: w / 2, y: h + h / 2, name: 'Zone2', enabled: true }];
    const zona3 = [{ x: w / 2, y: h * 2 + h / 2, name: 'Zone3', enabled: true }]; // desaparecen
    return [...spawn.map((cp) => ({ ...cp, enabled: true })), ...zigzag, ...zona2, ...zona3];
  }

  createZones() {
    const zoneWidth = this.canvas.width;
    const zoneHeight = this.canvas.height;
    const zoneNames = ['Control de documentos', 'Arcos y bandejas', 'Recogida de bandejas'];

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
    this.state.elapsedMs = Math.min(this.state.elapsedMs + deltaMs, this.state.durationMs);

    this.flightScheduleSystem.update(deltaSeconds, this.gameClock.totalMinutes);
    this.passengerQueueSystem.update();
    this.gameClock.setMode(this.interactionMode);
    this.gameClock.update(deltaSeconds);
    this.state.clock = this.gameClock.getSnapshot();
    this.inputSystem.update();
    if (this.inputSystem.consumeToggleQueueDebug()) {
      this.state.debugQueue = !this.state.debugQueue;
    }
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
    this.managePassengerClusters();
    this.updatePassengers(deltaSeconds);
    this.state.passengers = this.activePassengers;
    this.state.activePassengers = this.activePassengers;
    if (this.inspectionSystem.active) {
      const first = this.waitingFinalQueue[0];
      this.state.currentPassenger = first ? this.passengerDocs.get(first.id) ?? null : null;
    } else {
      this.state.currentPassenger = null;
    }
  }

  render() {
    this.renderer.render(this.state);
    this.flightPanel.render(this.state);
    this.inspectionOverlay.render(this.state);
    this.supervisorOverlay.render(this.state.supervisorMessages);
  }

  updateCameraTarget(zone) {
    if (!zone) return;
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
    const width = 90;
    const height = 80;
    const x = 25; // centrado en Zona 1
    const y = 290; // más abajo pero dentro de Zona 1
    return { x, y, width, height };
  }

  spawnTestPassengers(count = 5) {
    this.activePassengers = [];
    for (let i = 0; i < count; i += 1) {
      const entry = this.passengerQueueSystem.createPassengerEntry();
      const offsetX = (Math.random() - 0.5) * 60;
      entry.passenger.position.set(this.checkpoints[0].x + offsetX, this.checkpoints[0].y - i * 30);
      entry.passenger.currentTarget = 1; // primer objetivo visible
      this.activePassengers.push(entry.passenger);
      this.passengerDocs.set(entry.passenger.id, entry);
    }
  }

  handleInteraction() {
    const wantsInteract = this.inputSystem.consumeInteract();
    const wantsCancel = this.inputSystem.consumeCancel();

    if (wantsInteract) {
      if (!this.inspectionSystem.active && this.interactionSystem.canInspect) {
        this.enterInspectionMode();
        return;
      }
      // Si no se puede inspeccionar, intentamos alternar un checkpoint cercano
      this.toggleNearestCheckpoint();
    }

    if (this.inspectionSystem.active && wantsCancel) {
      this.exitInspectionMode();
    }
  }

  enterInspectionMode() {
    const mode = this.inspectionSystem.enter();
    this.setInteractionMode(mode);
    const first = this.waitingFinalQueue[0];
    this.state.currentPassenger = first ? this.passengerDocs.get(first.id) ?? null : null;
    this.state.inspectionResult = null;
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

    // Tomamos el primero esperando en la cola final
    const currentPassenger = this.waitingFinalQueue[0];
    if (!currentPassenger) {
      this.exitInspectionMode();
      return;
    }
    const entry = this.passengerDocs.get(currentPassenger.id);

    if (wantsAccept || wantsReject) {
      const decision = wantsReject ? 'REJECTED' : 'ACCEPTED';
      const evaluation = entry
        ? this.inspectionSystem.evaluateValidity(entry, this.flightScheduleSystem.flights)
        : { isValid: true, reasonText: 'Sin documentos' };

      currentPassenger.isValid = evaluation.isValid;
      currentPassenger.invalidReason = evaluation.reason;
      currentPassenger.decision = decision;

      let result = null;
      if (decision === 'ACCEPTED') {
        // liberar al pasajero: avanzar al siguiente checkpoint habilitado
        this.waitingFinalQueue.shift();
        const nextTarget = this.getNextEnabledIndex(this.finalCheckpointIndex + 1);
        currentPassenger.currentTarget = nextTarget === -1 ? 0 : nextTarget;
        result = {
          decision: 'ACCEPTED',
          passengerName: currentPassenger.name,
          flightCode: entry?.boardingPass?.flightId ?? 'N/A',
          reason: evaluation.isValid ? 'OK' : evaluation.reasonText,
        };
        console.info(`[Inspection] ACCEPTED - ${result.passengerName} (${result.reason})`);
      } else {
        // rechazar y remover
        this.waitingFinalQueue.shift();
        this.activePassengers = this.activePassengers.filter((p) => p.id !== currentPassenger.id);
        this.passengerDocs.delete(currentPassenger.id);
        result = {
          decision: 'REJECTED',
          passengerName: currentPassenger.name,
          flightCode: entry?.boardingPass?.flightId ?? 'N/A',
          reason: `Rechazado manualmente (${evaluation.reasonText ?? 'Sin docs'})`,
        };
        console.info(`[Inspection] REJECTED - ${result.passengerName} (${result.reason})`);
      }

      this.state.inspectionResult = result;
      this.state.passengers = this.activePassengers;
      this.state.currentPassenger = this.waitingFinalQueue[0] ?? null;
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
  }

  updatePassengers(deltaSeconds) {
    const passengers = this.activePassengers;
    const checkpoints = this.checkpoints;
    const anchoMapa = this.worldSize.width;
    const altoMapa = this.worldSize.height;
    const radioLlegada = 10;
    const finalIndex = this.finalCheckpointIndex;
    const queueSpacing = 20;

    this.activePassengers = passengers.filter((npc) => {
      const targetIndex = this.ensureEnabledTargetIndex(npc.currentTarget ?? 0);
      if (targetIndex === -1) return false;
      npc.currentTarget = targetIndex;
      const objetivoBase = checkpoints[targetIndex];
      if (!objetivoBase) return false;

      // Si está asignado al checkpoint final, alinearlo en la cola
      let targetX = objetivoBase.x;
      let targetY = objetivoBase.y;
      if (finalIndex !== -1 && npc.currentTarget === finalIndex) {
        if (!this.waitingFinalQueue.includes(npc)) {
          this.waitingFinalQueue.push(npc);
        }
        const idx = this.waitingFinalQueue.indexOf(npc);
        targetX = objetivoBase.x + queueSpacing * idx;
        targetY = objetivoBase.y;
      } else {
        const pos = this.waitingFinalQueue.indexOf(npc);
        if (pos !== -1) {
          this.waitingFinalQueue.splice(pos, 1);
        }
      }

      // PASO 1: dirección al objetivo
      let dx = targetX - npc.position.x;
      let dy = targetY - npc.position.y;
      const distancia = Math.hypot(dx, dy);

      // PASO 2: llegada al checkpoint
      if (distancia < radioLlegada) {
        if (finalIndex !== -1 && npc.currentTarget === finalIndex) {
          // Se queda esperando en el final hasta que el player lo libere
          return true;
        }
        const nextTarget = this.getNextEnabledIndex(npc.currentTarget + 1);
        npc.currentTarget = nextTarget;
        if (nextTarget === -1 || nextTarget === 0) {
          return false; // desaparece tras ciclo completo
        }
        return true;
      }

      // PASO 3: normalizar
      dx /= distancia;
      dy /= distancia;

      // PASO 4: espera por prioridad (solo si no es prioridad máxima)
      if (npc.prioridad !== null && npc.prioridad > 1 && npc.clusterId !== null) {
        for (const otro of passengers) {
          if (otro.id === npc.id) continue;
          if (otro.clusterId !== npc.clusterId) continue;
          if (otro.prioridad === null) continue;
          if (otro.prioridad >= npc.prioridad) continue;

          const odx = otro.position.x - npc.position.x;
          const ody = otro.position.y - npc.position.y;
          const odist = Math.hypot(odx, ody);
          const dot = odx * dx + ody * dy;
          if (odist < CONFIG_LIDER.distanciaEspera && dot > 0) {
            // apartarse lateralmente y no avanzar
            const perpX = -dy * npc.speed * 0.3 * deltaSeconds;
            const perpY = dx * npc.speed * 0.3 * deltaSeconds;
            npc.position.x += perpX;
            npc.position.y += perpY;
            return true;
          }
        }
      }

      // PASO 5: evitación con NPCs que no puedo traspasar
      let evitarX = 0;
      let evitarY = 0;
      for (const otro of passengers) {
        if (otro.id === npc.id) continue;
        if (npc.puedeTraspasar(otro)) continue;
        const dx2 = otro.position.x - npc.position.x;
        const dy2 = otro.position.y - npc.position.y;
        const dist2 = Math.hypot(dx2, dy2);
        if (dist2 < npc.detectionRadius && dist2 > 0) {
          const fuerza = (npc.detectionRadius - dist2) / npc.detectionRadius;
          evitarX -= (dx2 / dist2) * fuerza * 2;
          evitarY -= (dy2 / dist2) * fuerza * 2;
        }
      }
      dx += evitarX * npc.avoidanceStrength;
      dy += evitarY * npc.avoidanceStrength;

      // Re-normalizar
      const distFinal = Math.hypot(dx, dy);
      if (distFinal > 0) {
        dx /= distFinal;
        dy /= distFinal;
      }

      // PASO 6: nueva posición propuesta
      const nuevaX = npc.position.x + dx * npc.speed * deltaSeconds;
      const nuevaY = npc.position.y + dy * npc.speed * deltaSeconds;

      // PASO 7: colisión sólida con NPCs que no puedo traspasar
      let puedeMoverse = true;
      const distanciaMinima = 10 * 0.5;
      for (const otro of passengers) {
        if (otro.id === npc.id) continue;
        if (npc.puedeTraspasar(otro)) continue;
        const futDX = otro.position.x - nuevaX;
        const futDY = otro.position.y - nuevaY;
        const futDist = Math.hypot(futDX, futDY);
        if (futDist < distanciaMinima) {
          puedeMoverse = false;
          // Intento lateral
          const perpX = -dy * npc.speed * 0.5 * deltaSeconds;
          const perpY = dx * npc.speed * 0.5 * deltaSeconds;
          const alt1X = npc.position.x + perpX;
          const alt1Y = npc.position.y + perpY;
          const alt2X = npc.position.x - perpX;
          const alt2Y = npc.position.y - perpY;
          const dist1 = Math.hypot(otro.position.x - alt1X, otro.position.y - alt1Y);
          const dist2 = Math.hypot(otro.position.x - alt2X, otro.position.y - alt2Y);
          if (dist1 > distanciaMinima && dist1 > dist2) {
            npc.position.x = alt1X;
            npc.position.y = alt1Y;
          } else if (dist2 > distanciaMinima) {
            npc.position.x = alt2X;
            npc.position.y = alt2Y;
          }
          break;
        }
      }

      // PASO 8: aplicar movimiento si puede
      if (puedeMoverse) {
        npc.position.x = nuevaX;
        npc.position.y = nuevaY;
        npc.position.x = Math.max(0, Math.min(anchoMapa, npc.position.x));
        npc.position.y = Math.max(0, Math.min(altoMapa, npc.position.y));
      }
      return true;
    });

    // Limpiar cola final de referencias a NPCs que ya no existen
    if (finalIndex !== -1) {
      this.waitingFinalQueue = this.waitingFinalQueue.filter((p) => this.activePassengers.includes(p));
    }
  }

  getNextEnabledIndex(startIndex = 0) {
    const n = this.checkpoints.length;
    for (let i = 0; i < n; i += 1) {
      const idx = (startIndex + i) % n;
      if (this.checkpoints[idx]?.enabled) return idx;
    }
    return -1;
  }

  ensureEnabledTargetIndex(currentIndex = 0) {
    const cp = this.checkpoints[currentIndex];
    if (cp?.enabled) return currentIndex;
    return this.getNextEnabledIndex(currentIndex + 1);
  }

  toggleCheckpoint(name, enabled = undefined) {
    const cp = this.checkpoints.find((c) => c.name === name);
    if (!cp) return null;
    cp.enabled = enabled !== undefined ? enabled : !cp.enabled;
    return cp.enabled;
  }

  toggleNearestCheckpoint(radius = 40) {
    let nearest = null;
    let minDist = Number.POSITIVE_INFINITY;
    for (const cp of this.checkpoints) {
      if (!cp.name.startsWith('ZZ-')) continue; // solo zig-zag
      const dx = cp.x - this.player.position.x;
      const dy = cp.y - this.player.position.y;
      const dist = Math.hypot(dx, dy);
      if (dist < radius && dist < minDist) {
        nearest = cp;
        minDist = dist;
      }
    }
    if (nearest) {
      nearest.enabled = !nearest.enabled;
      console.info(`[Checkpoint] ${nearest.name} -> ${nearest.enabled ? 'ON' : 'OFF'}`);
    }
  }

  advanceQueueStep() {
    const slots = this.entryQueue.slots;
    const epsilon = this.queueMovementSystem.epsilon;
    for (let i = 1; i < slots.length; i += 1) {
      const slot = slots[i];
      const passenger = slot.occupiedBy;
      if (!passenger) continue;
      const distance = Math.hypot(
        passenger.position.x - slot.position.x,
        passenger.position.y - slot.position.y,
      );
      if (distance > epsilon) continue;
      const nextSlot = slots[i - 1];
      if (nextSlot.isFree()) {
        nextSlot.occupy(passenger);
        slot.release();
      }
    }
  }

  releaseFrontSlot() {
    // Legacy no-op
  }

  reorderQueueFromSlots() {
    // Legacy no-op
  }

  managePassengerClusters() {
    const passengers = this.activePassengers;
    // limpiar estado previo
    passengers.forEach((p) => {
      p.clusterId = null;
      p.prioridad = null;
      p.npcsDetectados = [];
    });

    const processed = new Set();
    let clusterIdCounter = 0;
    const sorted = [...passengers].sort((a, b) => a.id - b.id);

    sorted.forEach((npc) => {
      if (processed.has(npc.id)) return;
      const count = npc.detectarNPCsCercanos(passengers, CONFIG_LIDER.radioDeteccion);
      if (count >= CONFIG_LIDER.minClusters - 1) {
        const miembros = [npc];
        processed.add(npc.id);
        for (const cercano of npc.npcsDetectados) {
          if (miembros.length >= CONFIG_LIDER.maxClusters) break;
          if (!processed.has(cercano.npc.id)) {
            miembros.push(cercano.npc);
            processed.add(cercano.npc.id);
          }
        }
        if (miembros.length >= CONFIG_LIDER.minClusters) {
          this.assignPriorities(miembros, clusterIdCounter);
          clusterIdCounter += 1;
        }
      }
    });
  }

  assignPriorities(miembrosCluster, clusterId) {
    if (!miembrosCluster.length) return;
    const allInSpecial = miembrosCluster.every((m) => m.enZonaEspecial());
    if (allInSpecial) {
      miembrosCluster.sort((a, b) => {
        if (a.queuePosition !== null && b.queuePosition !== null && a.queuePosition !== b.queuePosition) {
          return a.queuePosition - b.queuePosition;
        }
        return a.id - b.id;
      });
    } else {
      miembrosCluster.sort((a, b) => {
        if (Math.abs(a.speed - b.speed) > 0.1) {
          return b.speed - a.speed;
        }
        const targetA = this.checkpoints[a.currentTarget ?? 0];
        const targetB = this.checkpoints[b.currentTarget ?? 0];
        const distA = targetA ? Math.hypot(targetA.x - a.position.x, targetA.y - a.position.y) : 0;
        const distB = targetB ? Math.hypot(targetB.x - b.position.x, targetB.y - b.position.y) : 0;
        if (Math.abs(distA - distB) > 5) {
          return distA - distB;
        }
        return a.id - b.id;
      });
    }

    miembrosCluster.forEach((m, idx) => {
      m.clusterId = clusterId;
      m.prioridad = idx + 1;
    });
  }

}
