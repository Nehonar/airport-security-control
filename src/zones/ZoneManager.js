export default class ZoneManager {
  constructor() {
    this.zones = [];
    this.activeZone = null;
  }

  addZone(zone) {
    this.zones.push(zone);
  }

  update(player) {
    if (!player) return;
    const point = {
      x: player.position.x + player.size.x / 2,
      y: player.position.y + player.size.y / 2,
    };

    const zone = this.zones.find((z) => z.contains(point)) ?? null;
    if (zone && this.activeZone?.id !== zone.id) {
      this.activeZone = zone;
      console.log(`Zona activa: ${zone.name}`);
    }
  }
}
