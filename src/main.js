// ============================================================
// Medieval Kingshot - Entry Point (Formato 16:9 Responsivo)
// ============================================================
// Engine estilo Kingshot: herói controlado por mouse/toque,
// ataque automático, coleta de moedas, construção de torres.
// Funciona em PC (mouse) e celular (toque) - formato horizontal.
// ============================================================

import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import RankingScene from './scenes/RankingScene.js';
import GameScene from './scenes/GameScene.js';

// Resolução base 16:9 - escala para preencher a tela inteira
const LARGURA_BASE = 1280;
const ALTURA_BASE = 720;

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: LARGURA_BASE,
  height: ALTURA_BASE,
  backgroundColor: '#1a1410',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  // Scale.FIT: escala mantendo proporção 16:9 (mais estável que RESIZE)
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LARGURA_BASE,
    height: ALTURA_BASE,
  },
  input: {
    activePointers: 3, // suporta multi-toque
  },
  scene: [BootScene, PreloadScene, MenuScene, RankingScene, GameScene],
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
