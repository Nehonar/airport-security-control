import Game from './src/core/Game.js';

const canvas = document.getElementById('game-canvas');

function resizeCanvas() {
  const scale = Math.min(window.innerWidth / canvas.width, window.innerHeight / canvas.height, 1);
  canvas.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeCanvas);

const game = new Game({ canvas });
resizeCanvas();
game.start();
