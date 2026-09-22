// ============================================================
// Medieval Kingshot - Enemy
// ============================================================
// Inimigos que avançam em direção ao castelo (base principal).
// O herói e as torres podem matá-los. Dropam moedas ao morrer.
// ============================================================

import Phaser from 'phaser';

export const TIPOS_INIMIGO = {
  goblin: {
    tipo: 'goblin',
    textura: 'enemy_goblin',
    hp: 30,
    velocidade: 50,
    dano: 5,
    recompensaMoedas: 1,
    recompensaScore: 10,
    escala: 1,
  },
  ogro: {
    tipo: 'ogro',
    textura: 'enemy_ogre',
    hp: 120,
    velocidade: 35,
    dano: 15,
    recompensaMoedas: 3,
    recompensaScore: 30,
    escala: 1.4,
  },
  ogroBlindado: {
    tipo: 'ogroBlindado',
    textura: 'enemy_armored_ogre',
    hp: 280,
    velocidade: 25,
    dano: 30,
    recompensaMoedas: 8,
    recompensaScore: 100,
    escala: 1.6,
  },
};

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.textura);

    this.scene = scene;
    this.tipo = config.tipo;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.velocidade = config.velocidade;
    this.dano = config.dano;
    this.recompensaMoedas = config.recompensaMoedas;
    this.recompensaScore = config.recompensaScore;
    this.estaMorto = false;
    this.escala = config.escala || 1;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(this.escala);
    this.body.setCircle(14, 2, 4);
    this.body.setCollideWorldBounds(false);

    // Barra de HP (acima do inimigo)
    const barraLargura = 30 * this.escala;
    this.barraFundo = scene.add.rectangle(this.x, this.y - 22 * this.escala, barraLargura + 2, 5, 0x000000, 0.7);
    this.barraHp = scene.add.rectangle(this.x, this.y - 22 * this.escala, barraLargura, 3, 0xe74c3c);

    // Animação de respiração
    scene.tweens.add({
      targets: this,
      scaleX: { from: this.escala, to: this.escala * 1.05 },
      scaleY: { from: this.escala, to: this.escala * 0.96 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Move em direção ao castelo (alvo principal).
   */
  moverPara(alvo) {
    if (this.estaMorto || !alvo) return;
    this.scene.physics.moveToObject(this, alvo, this.velocidade);
    const angulo = Phaser.Math.Angle.Between(this.x, this.y, alvo.x, alvo.y);
    this.setRotation(angulo + Math.PI / 2);
  }

  receberDano(dano) {
    if (this.estaMorto) return false;
    this.hp -= dano;

    // Flash branco de dano
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
    const largura = 30 * this.escala;
    this.barraHp.width = largura * pct;
    this.barraFundo.setPosition(this.x, this.y - 22 * this.escala);
    this.barraHp.setPosition(this.x, this.y - 22 * this.escala);
  }

  morrer() {
    if (this.estaMorto) return;
    this.estaMorto = true;

    if (this.barraFundo) this.barraFundo.destroy();
    if (this.barraHp) this.barraHp.destroy();

    // Dropa moedas no chão
    if (this.scene.droparMoedas) {
      this.scene.droparMoedas(this.x, this.y, this.recompensaMoedas);
    }

    // Animação de morte
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: this.escala * 1.4,
      scaleY: this.escala * 1.4,
      duration: 300,
      ease: 'Quad.out',
      onComplete: () => this.destroy(),
    });

    if (this.scene.onEnemyKilled) {
      this.scene.onEnemyKilled(this);
    }
  }

  /**
   * Quando o inimigo chega no castelo, causa dano e some.
   */
  baterNoCastelo() {
    if (this.estaMorto) return;
    if (this.scene.castelo && this.scene.castelo.receberDano) {
      this.scene.castelo.receberDano(this.dano);
    }
    this.estaMorto = true;
    if (this.barraFundo) this.barraFundo.destroy();
    if (this.barraHp) this.barraHp.destroy();
    this.destroy();
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
