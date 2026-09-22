// ============================================================
// Medieval Kingshot - Coin (Moeda no chão)
// ============================================================
// Moedas dropadas pelos inimigos. Giram para chamar atenção.
// Coletadas automaticamente quando o herói passa por cima.
// ============================================================

import Phaser from 'phaser';

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setCircle(10, 0, 0);
    this.body.setImmovable(true);
    this.body.setAllowGravity(false);

    // Pequeno salto inicial (para parecer que caiu do inimigo)
    const offsetX = Phaser.Math.Between(-15, 15);
    const offsetY = Phaser.Math.Between(-15, 15);
    this.x += offsetX;
    this.y += offsetY;

    // Animação de giro (simula 3D)
    scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 0.2 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Animação de flutuação
    scene.tweens.add({
      targets: this,
      y: this.y - 5,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Tempo de vida: 15s (some se não for coletada)
    scene.time.delayedCall(15000, () => {
      if (this && this.active) {
        scene.tweens.add({
          targets: this,
          alpha: 0,
          duration: 500,
          onComplete: () => this.destroy(),
        });
      }
    });
  }
}
