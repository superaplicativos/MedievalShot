// ============================================================
// Medieval Kingshot - Projectile
// ============================================================
// Projétil genérico: flecha, bola de canhão, raio mágico.
// Move-se em linha reta até o alvo.
// ============================================================

import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, alvo, dano, config = {}) {
    const textura = config.projetilTextura || 'arrow';
    super(scene, x, y, textura);
    this.scene = scene;
    this.alvo = alvo;
    this.dano = dano;
    this.velocidade = config.projetilVelocidade || 400;
    this.atingiu = false;

    const escala = config.projetilEscala || 1;
    this.setScale(escala);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Rotaciona para apontar ao alvo
    const angulo = Phaser.Math.Angle.Between(x, y, alvo.x, alvo.y);
    this.setRotation(angulo + Math.PI / 2);

    // Move em direção ao alvo
    scene.physics.moveToObject(this, alvo, this.velocidade);

    // Tempo de vida máximo
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
    // Efeito visual de impacto
    const cor = this.texture.key === 'magic_bolt' ? 0xddaaff : 0xffdd44;
    const impacto = this.scene.add.circle(this.x, this.y, 4, cor);
    this.scene.tweens.add({
      targets: impacto,
      radius: 20,
      alpha: 0,
      duration: 250,
      ease: 'Quad.out',
      onComplete: () => impacto.destroy(),
    });
  }

  destruir() {
    if (!this.active) return;
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 80,
      onComplete: () => this.destroy(),
    });
  }
}
