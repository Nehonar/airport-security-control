export default class FlightPanel {
  constructor(root = document.body) {
    this.root = root;
    this.container = document.createElement('div');
    this.container.className = 'flight-panel';
    this.list = document.createElement('div');
    this.list.className = 'flight-panel__list';
    this.container.appendChild(this.list);
    this.root.appendChild(this.container);
  }

  render(state) {
    if (!state) return;
    const flights = state.flights ?? [];
    const clock = state.clock ?? { time: '--:--' };
    const rows = flights
      .map(
        (f) => `
        <div class="flight-row">
          <span class="flight-code">${f.code}</span>
          <span class="flight-dest">${f.destination}</span>
          <span class="flight-time">${f.departureTime}</span>
          <span class="flight-status flight-status--${f.status.toLowerCase()}">${f.status}</span>
        </div>
      `,
      )
      .join('');

    this.list.innerHTML = `
      <div class="flight-panel__header">
        <div>Vuelos del día</div>
        <div class="flight-panel__clock">Hora: ${clock.time}</div>
      </div>
      ${rows}
    `;
  }
}
