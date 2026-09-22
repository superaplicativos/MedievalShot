// ============================================================
// Medieval Kingshot - Ponto de Entrada (main.js)
// ============================================================
// Registra todas as cenas do jogo (single-player puro).
// ============================================================

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import RankingScene from './scenes/RankingScene.js';
import Level01Scene from './scenes/Level01Scene.js';
import Level02Scene from './scenes/Level02Scene.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  backgroundColor: '#1a1410',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, PreloadScene, MenuScene, RankingScene, Level01Scene, Level02Scene],
};

const game = new Phaser.Game(config);

window.addEventListener('load', () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.transition = 'opacity 0.5s';
    loading.style.opacity = '0';
    setTimeout(() => loading.remove(), 500);
  }
});

if (typeof window !== 'undefined') {
  window.game = game;
}

export default game;
