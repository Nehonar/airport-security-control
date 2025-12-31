export default class InspectionOverlay {
  constructor(root = document.body) {
    this.root = root;
    this.container = document.createElement('div');
    this.container.className = 'inspection-overlay';
    this.container.style.display = 'none';

    this.content = document.createElement('div');
    this.content.className = 'inspection-overlay__message';

    this.title = document.createElement('div');
    this.title.className = 'inspection-overlay__title';

    this.docs = document.createElement('div');
    this.docs.className = 'inspection-overlay__docs';

    this.boardingCard = document.createElement('div');
    this.boardingCard.className = 'doc-card';
    this.passportCard = document.createElement('div');
    this.passportCard.className = 'doc-card';

    this.docs.appendChild(this.boardingCard);
    this.docs.appendChild(this.passportCard);

    this.instructions = document.createElement('div');
    this.instructions.className = 'inspection-overlay__instructions';

    this.content.appendChild(this.title);
    this.content.appendChild(this.docs);
    this.content.appendChild(this.instructions);
    this.container.appendChild(this.content);

    this.root.appendChild(this.container);
  }

  render(state) {
    const active = state?.interactionMode === 'DOCUMENT_INSPECTION';
    if (!active) {
      this.container.style.display = 'none';
      return;
    }
    this.container.style.display = 'flex';
    const entry = state?.currentPassenger;
    const passenger = entry?.passenger;
    const boarding = entry?.boardingPass;
    const passport = entry?.passport;
    const result = state?.inspectionResult;
    const flight = state?.flights?.find((f) => f.id === boarding?.flightId);

    this.title.innerHTML = `Inspección de documentos<br><small>Pasajero: ${passenger?.name ?? '---'}</small>`;
    this.boardingCard.innerHTML = `
      <h4>Boarding Pass</h4>
      <div>Nombre: ${boarding?.passengerName ?? '---'}</div>
      <div>Vuelo: ${flight?.code ?? boarding?.flightId ?? '---'}</div>
      <div>Destino: ${flight?.destination ?? '---'}</div>
      <div>Salida: ${flight?.departureTime ?? '---'}</div>
    `;
    this.passportCard.innerHTML = `
      <h4>Pasaporte</h4>
      <div>Nombre: ${passport?.passengerName ?? '---'}</div>
    `;
    const resultText = result
      ? `Último resultado: ${result.decision} (${result.reason})`
      : 'Pulsa F para ACEPTAR, R para RECHAZAR, ESC para salir';
    this.instructions.innerText = resultText;
  }
}
