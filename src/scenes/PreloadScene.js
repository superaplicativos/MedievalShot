// ============================================================
// Medieval Kingshot - PreloadScene
// ============================================================
// Carrega as imagens reais de /public/assets/.
// Remove placeholders do BootScene antes de carregar.
// ============================================================

import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Remove placeholders do BootScene
    const texturas = ['tower', 'enemy_goblin', 'enemy_ogre', 'enemy_armored_ogre', 'arrow'];
    texturas.forEach((nome) => {
      if (this.textures.exists(nome)) this.textures.remove(nome);
    });

    // Barra de carregamento
    const largura = this.scale.width;
    const altura = this.scale.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(largura / 2 - 160, altura / 2 - 25, 320, 50);

    const textoCarregando = this.add
      .text(largura / 2, altura / 2 - 50, 'Carregando reino...', {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        color: '#d4a544',
      })
      .setOrigin(0.5);

    const textoPercent = this.add
      .text(largura / 2, altura / 2, '0%', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (valor) => {
      progressBar.clear();
      progressBar.fillStyle(0xd4a544, 1);
      progressBar.fillRect(largura / 2 - 156, altura / 2 - 21, 312 * valor, 42);
      textoPercent.setText(`${Math.floor(valor * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      textoCarregando.destroy();
      textoPercent.destroy();
    });

    // Carrega imagens reais
    this.load.image('tower', 'assets/tower.png');
    this.load.image('enemy_goblin', 'assets/enemy_goblin.png');
    this.load.image('enemy_ogre', 'assets/enemy_ogre.png');
    this.load.image('enemy_armored_ogre', 'assets/enemy_armored_ogre.png');
    this.load.image('arrow', 'assets/arrow.png');

    // Trata erros
    this.load.on('loaderror', (file) => {
      console.warn('[PreloadScene] Erro ao carregar:', file.key);
    });
  }

  create() {
    console.log('[PreloadScene] Assets carregados.');
    ['tower', 'enemy_goblin', 'enemy_ogre', 'enemy_armored_ogre', 'arrow'].forEach((nome) => {
      if (this.textures.exists(nome)) {
        const tex = this.textures.get(nome);
        console.log(`  ✓ ${nome}: ${tex.source[0].width}x${tex.source[0].height}`);
      }
    });
    this.scene.start('MenuScene');
  }
}
