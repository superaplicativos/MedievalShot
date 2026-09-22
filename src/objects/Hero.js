// ============================================================
// Medieval Kingshot - Hero (Cavaleiro controlado pelo jogador)
// ============================================================
// Engine estilo Kingshot:
//   - Movimento: segue o mouse/toque (clicar e segurar para mover)
//   - Ataque automático: atira no inimigo mais próximo quando parado
//   - Coleta moedas: ao passar por cima, automaticamente
// ============================================================

import Phaser from 'phaser';

export default class Hero extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');
    this.scene = scene;

    // Adiciona à cena e física
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Atributos
    this.maxSpeed = 250; // px/s
    this.alcanceAtaque = 280;
    this.intervaloAtaque = 500; // ms entre tiros
    this.dano = 35;
    this.parado = true;
    this.ultimoTiro = 0;
    this.raioColeta = 60;

    // Hitbox (circular)
    this.body.setCircle(20, 12, 24);
    this.body.setCollideWorldBounds(true);
    this.body.setDrag(800, 800);

    // Escala
    this.setScale(1.2);

    // Animação de respiração
    scene.tweens.add({
      targets: this,
      scaleX: { from: 1.2, to: 1.25 },
      scaleY: { from: 1.2, to: 1.18 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Move o herói em direção a um ponto (mouse/toque).
   * Se já estiver próximo, para.
   */
  moverPara(destinoX, destinoY) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, destinoX, destinoY);
    if (dist < 10) {
      this.parar();
      return;
    }
    this.parado = false;
    this.scene.physics.moveTo(this, destinoX, destinoY, this.maxSpeed);
    // Rotaciona para "olhar" na direção do movimento
    const angulo = Phaser.Math.Angle.Between(this.x, this.y, destinoX, destinoY);
    // O sprite aponta para cima por padrão; rotacionamos para apontar para o destino
    this.setRotation(angulo + Math.PI / 2);
  }

  parar() {
    this.parado = true;
    this.body.setVelocity(0, 0);
  }

  /**
   * Atira no inimigo mais próximo dentro do alcance.
   */
  tentarAtacar(time) {
    if (!this.parado) return; // só atira quando parado (estilo Kingshot)
    if (time - this.ultimoTiro < this.intervaloAtaque) return;

    const alvo = this.inimigoMaisProximo();
    if (!alvo) return;

    this.ultimoTiro = time;
    if (this.scene.criarProjetilHeroi) {
      this.scene.criarProjetilHeroi(this.x, this.y - 10, alvo, this.dano);
    }
  }

  inimigoMaisProximo() {
    if (!this.scene.inimigos || this.scene.inimigos.getLength() === 0) return null;
    let maisProximo = null;
    let menorDist = this.alcanceAtaque;
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

  /**
   * Coleta moedas automaticamente ao passar por cima.
   */
  coletarMoedas() {
    if (!this.scene.moedas) return;
    this.scene.moedas.getChildren().forEach((moeda) => {
      if (!moeda.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, moeda.x, moeda.y);
      if (dist < this.raioColeta) {
        // Coleta
        if (this.scene.coletarMoeda) {
          this.scene.coletarMoeda(moeda);
        }
      }
    });
  }

  update(time) {
    this.tentarAtacar(time);
    this.coletarMoedas();
  }
}
