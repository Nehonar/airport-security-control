export default class SupervisorOverlay {
  constructor(root = document.body) {
    this.root = root;
    this.container = document.createElement('div');
    this.container.className = 'supervisor-overlay';
    this.root.appendChild(this.container);
  }

  render(messages = []) {
    if (!messages || messages.length === 0) {
      this.container.style.display = 'none';
      return;
    }
    this.container.style.display = 'flex';
    this.container.innerHTML = messages
      .map((m) => `<div class="supervisor-message">${m.text}</div>`)
      .join('');
  }
}
