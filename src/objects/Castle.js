// ============================================================
// Medieval Kingshot - Castle (Base do Jogador)
// ============================================================
// O castelo é a base principal. Se o HP chegar a 0, game over.
// Os inimigos avançam em direção ao castelo.
// ============================================================

import Phaser from 'phaser';

export default class Castle extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;

    this.maxHp = 200;
    this.hp = this.maxHp;

    // Sprite do castelo
    this.sprite = scene.add.image(0, 0, 'castle').setDisplaySize(120, 120);
    this.add(this.sprite);

    // Barra de HP acima do castelo
    this.barraFundo = scene.add.rectangle(0, -75, 100, 12, 0x000000, 0.8);
    this.barraFundo.setStrokeStyle(1, 0xffffff, 0.5);
    this.add(this.barraFundo);

    this.barraHp = scene.add.rectangle(0, -75, 96, 8, 0xe74c3c);
    this.add(this.barraHp);

    this.textoHp = scene.add
      .text(0, -90, `${this.hp}/${this.maxHp}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.add(this.textoHp);

    scene.add.existing(this);

    // Física
    scene.physics.add.existing(this, true);
    this.body.setCircle(60, -60, -60);
  }

  receberDano(dano) {
    this.hp = Math.max(0, this.hp - dano);
    this.atualizarBarraHp();

    // Flash de dano
    this.sprite.setTint(0xff4444);
    this.scene.time.delayedCall(150, () => {
      if (this.sprite) this.sprite.clearTint();
    });

    // Screen shake
    this.scene.cameras.main.shake(100, 0.005);

    if (this.hp <= 0 && this.scene.onDerrota) {
      this.scene.onDerrota();
    }
  }

  atualizarBarraHp() {
    const pct = Math.max(0, this.hp / this.maxHp);
    this.barraHp.width = 96 * pct;
    if (pct > 0.5) this.barraHp.fillColor = 0x2ecc71;
    else if (pct > 0.25) this.barraHp.fillColor = 0xf1c40f;
    else this.barraHp.fillColor = 0xe74c3c;
    this.textoHp.setText(`${this.hp}/${this.maxHp}`);
  }
}
