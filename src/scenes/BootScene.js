// ============================================================
// Medieval Kingshot - BootScene
// ============================================================
// Cena inicial. Gera placeholders caso as imagens reais falhem.
// (As imagens reais já foram geradas em /public/assets/)
// ============================================================

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    console.log('[BootScene] Inicializando Medieval Kingshot...');
    this.criarPlaceholders();
    this.scene.start('PreloadScene');
  }

  criarPlaceholders() {
    // Torre (placeholder - caso tower.png não carregue)
    if (!this.textures.exists('tower')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6b6b6b, 1);
      g.fillRect(20, 30, 88, 80);
      g.fillStyle(0xd4a544, 1);
      g.fillRect(35, 10, 58, 30);
      g.generateTexture('tower', 128, 128);
      g.destroy();
    }

    // Goblin (placeholder)
    if (!this.textures.exists('enemy_goblin')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x88cc44, 1);
      g.fillCircle(32, 32, 22);
      g.generateTexture('enemy_goblin', 64, 64);
      g.destroy();
    }

    // Ogro (placeholder)
    if (!this.textures.exists('enemy_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x5a8a3a, 1);
      g.fillCircle(48, 48, 36);
      g.generateTexture('enemy_ogre', 96, 96);
      g.destroy();
    }

    // Ogro Blindado (placeholder)
    if (!this.textures.exists('enemy_armored_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x9a8a7a, 1);
      g.fillCircle(48, 48, 36);
      g.generateTexture('enemy_armored_ogre', 96, 96);
      g.destroy();
    }

    // Flecha (placeholder)
    if (!this.textures.exists('arrow')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x3a2a1a, 1);
      g.fillRect(7, 8, 4, 14);
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(9, 2, 5, 8, 13, 8);
      g.generateTexture('arrow', 18, 30);
      g.destroy();
    }

    console.log('[BootScene] Placeholders verificados.');
  }
}
