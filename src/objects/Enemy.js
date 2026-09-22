// ============================================================
// Medieval Kingshot - Enemy (Inimigos)
// ============================================================
// Classe base para Goblin, Ogro e Ogro Blindado.
// ============================================================

import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textura, config = {}) {
    super(scene, x, y, textura);

    this.scene = scene;
    this.tipo = config.tipo || 'generico';
    this.maxHp = config.hp ?? 30;
    this.hp = this.maxHp;
    this.velocidade = config.velocidade ?? 80;
    this.dano = config.dano ?? 10;
    this.recompensa = config.recompensa ?? 10;
    this.scoreValue = config.scoreValue ?? config.recompensa;
    this.estaMorto = false;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Hitbox circular
    const tam = config.tamanho ?? 32;
    this.body.setCircle(tam / 2, (this.width - tam) / 2, (this.height - tam) / 2);
    this.body.setOffset(0, 0);

    // Barra de HP
    this.barraFundo = scene.add.rectangle(this.x, this.y - this.height / 2 - 8, 40, 6, 0x000000, 0.7);
    this.barraHp = scene.add.rectangle(this.x, this.y - this.height / 2 - 8, 38, 4, 0xe74c3c);

    // Animação de respiração
    scene.tweens.add({
      targets: this,
      scaleX: { from: 1, to: 1.05 },
      scaleY: { from: 1, to: 0.97 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  moverPara(alvo) {
    if (this.estaMorto || !alvo) return;
    this.scene.physics.moveToObject(this, alvo, this.velocidade);
    const angulo = Phaser.Math.Angle.Between(this.x, this.y, alvo.x, alvo.y);
    this.setRotation(angulo + Math.PI / 2);
  }

  receberDano(dano) {
    if (this.estaMorto) return false;
    this.hp -= dano;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this && !this.estaMorto) this.clearTint();
    });
    this.atualizarBarraHp();
    if (this.hp <= 0) {
      this.morrer();
      return true;
    }
    return false;
  }

  atualizarBarraHp() {
    if (!this.barraHp) return;
    const pct = Math.max(0, this.hp / this.maxHp);
    this.barraHp.width = 38 * pct;
    this.barraFundo.setPosition(this.x, this.y - this.height / 2 - 8);
    this.barraHp.setPosition(this.x, this.y - this.height / 2 - 8);
  }

  morrer() {
    if (this.estaMorto) return;
    this.estaMorto = true;
    if (this.barraFundo) this.barraFundo.destroy();
    if (this.barraHp) this.barraHp.destroy();

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      ease: 'Quad.out',
      onComplete: () => this.destroy(),
    });

    if (this.scene.onEnemyKilled) this.scene.onEnemyKilled(this);
  }

  update(_time) {
    if (this.estaMorto) return;
    this.atualizarBarraHp();
  }

  destroy(fromScene) {
    if (this.barraFundo) this.barraFundo.destroy();
    if (this.barraHp) this.barraHp.destroy();
    super.destroy(fromScene);
  }
}

// Configurações pré-definidas por tipo de inimigo
export const TIPOS_INIMIGO = {
  goblin: {
    tipo: 'goblin',
    textura: 'enemy_goblin',
    hp: 30,
    velocidade: 90,
    dano: 10,
    recompensa: 10,
    scoreValue: 15,
  },
  ogro: {
    tipo: 'ogro',
    textura: 'enemy_ogre',
    hp: 80,
    velocidade: 60,
    dano: 20,
    recompensa: 25,
    scoreValue: 40,
  },
  ogroBlindado: {
    tipo: 'ogroBlindado',
    textura: 'enemy_armored_ogre',
    hp: 180,
    velocidade: 45,
    dano: 35,
    recompensa: 60,
    scoreValue: 100,
  },
};
