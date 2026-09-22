// ============================================================
// Medieval Kingshot - Projectile (Flecha)
// ============================================================

import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, alvo, dano = 25, velocidade = 350) {
    super(scene, x, y, 'arrow');
    this.scene = scene;
    this.alvo = alvo;
    this.dano = dano;
    this.velocidade = velocidade;
    this.atingiu = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const angulo = Phaser.Math.Angle.Between(x, y, alvo.x, alvo.y);
    this.setRotation(angulo + Math.PI / 2);

    scene.physics.moveToObject(this, alvo, this.velocidade);

    scene.time.delayedCall(2500, () => {
      if (this && this.active) this.destruir();
    });
  }

  bater(inimigoAtingido) {
    if (this.atingiu || !inimigoAtingido || inimigoAtingido.estaMorto) {
      this.destruir();
      return;
    }
    this.atingiu = true;
    if (inimigoAtingido.receberDano) {
      inimigoAtingido.receberDano(this.dano);
    }
    this.criarEfeitoImpacto();
    this.destruir();
  }

  criarEfeitoImpacto() {
    const impacto = this.scene.add.circle(this.x, this.y, 4, 0xffdd44);
    this.scene.tweens.add({
      targets: impacto,
      radius: 18,
      alpha: 0,
      duration: 220,
      ease: 'Quad.out',
      onComplete: () => impacto.destroy(),
    });
  }

  destruir() {
    if (!this.active) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 100,
      onComplete: () => this.destroy(),
    });
  }
}
