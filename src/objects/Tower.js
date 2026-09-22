// ============================================================
// Medieval Kingshot - Tower (Torre do Jogador)
// ============================================================
// Castelo central do jogador. Atira automaticamente no
// inimigo mais próximo dentro do alcance.
// ============================================================

import Phaser from 'phaser';

export default class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config = {}) {
    super(scene, x, y);

    this.scene = scene;
    this.maxHp = config.hp ?? 100;
    this.hp = this.maxHp;
    this.danoPorToque = config.danoPorToque ?? 10;
    this.alcance = config.alcance ?? 320;
    this.intervaloTiro = config.intervaloTiro ?? 1000;
    this.danoFlecha = config.danoFlecha ?? 25;

    // ----- Sprite -----
    if (scene.textures.exists('tower')) {
      this.sprite = scene.add.image(0, 0, 'tower');
      this.sprite.setDisplaySize(96, 96);
      this.add(this.sprite);
    } else {
      // Fallback (placeholder caso a imagem não carregue)
      const base = scene.add.rectangle(0, 0, 70, 70, 0x6b6b6b);
      base.setStrokeStyle(3, 0x3a3a3a);
      const topo = scene.add.rectangle(0, -20, 50, 20, 0xd4a544);
      topo.setStrokeStyle(2, 0x5a3a20);
      this.add([base, topo]);
    }

    // ----- Barra de HP -----
    this.barraFundo = scene.add.rectangle(0, -65, 80, 10, 0x000000, 0.7);
    this.barraFundo.setStrokeStyle(1, 0xffffff, 0.6);
    this.barraHp = scene.add.rectangle(0, -65, 76, 6, 0xe74c3c);
    this.add([this.barraFundo, this.barraHp]);

    this.textoHp = scene.add
      .text(0, -82, `${this.hp}/${this.maxHp}`, {
        fontFamily: 'Georgia, serif',
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.add(this.textoHp);

    // ----- Física -----
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.body.setCircle(35, 13, 13);

    // ----- Timer de tiro -----
    this.timerTiro = scene.time.addEvent({
      delay: this.intervaloTiro,
      callback: this.atirar,
      callbackScope: this,
      loop: true,
    });
  }

  inimigoMaisProximo() {
    if (!this.scene.inimigos || this.scene.inimigos.getLength() === 0) return null;
    let maisProximo = null;
    let menorDist = this.alcance;
    this.scene.inimigos.getChildren().forEach((inimigo) => {
      if (!inimigo.active || inimigo.estaMorto) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, inimigo.x, inimigo.y);
      if (dist < menorDist) {
        menorDist = dist;
        maisProximo = inimigo;
      }
    });
    return maisProximo;
  }

  atirar() {
    const alvo = this.inimigoMaisProximo();
    if (!alvo) return;
    if (this.scene.criarProjetil) {
      this.scene.criarProjetil(this.x, this.y - 10, alvo, this.danoFlecha);
    }
  }

  receberDano(dano) {
    this.hp = Math.max(0, this.hp - dano);
    this.atualizarBarraHp();

    if (this.sprite) {
      this.sprite.setTint(0xff4444);
      this.scene.time.delayedCall(120, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }

    if (this.scene.onTowerDamaged) this.scene.onTowerDamaged(this.hp);
    if (this.hp <= 0 && this.scene.onDerrota) this.scene.onDerrota();
  }

  atualizarBarraHp() {
    const pct = Math.max(0, this.hp / this.maxHp);
    this.barraHp.width = 76 * pct;
    if (pct > 0.5) this.barraHp.fillColor = 0x2ecc71;
    else if (pct > 0.25) this.barraHp.fillColor = 0xf1c40f;
    else this.barraHp.fillColor = 0xe74c3c;
    this.textoHp.setText(`${this.hp}/${this.maxHp}`);
  }

  destroy(fromScene) {
    if (this.timerTiro) this.timerTiro.remove();
    super.destroy(fromScene);
  }
}
