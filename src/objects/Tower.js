// ============================================================
// Medieval Kingshot - Tower
// ============================================================
// Torres construídas pelo jogador. Atacam sozinhas.
// Tipos: arqueiro (flechas), canhão (bolas de ferro),
// balista (setas grandes), mago (raios mágicos).
// ============================================================

import Phaser from 'phaser';

export const TIPOS_TORRE = {
  archer: {
    tipo: 'archer',
    textura: 'tower_archer',
    nome: 'Torre de Arqueiro',
    custo: 25,
    alcance: 200,
    intervaloAtaque: 800,
    dano: 15,
    projetilTextura: 'arrow',
    projetilVelocidade: 400,
    projetilEscala: 1,
    corDestaque: 0xd4a544,
  },
  cannon: {
    tipo: 'cannon',
    textura: 'tower_cannon',
    nome: 'Canhão',
    custo: 60,
    alcance: 220,
    intervaloAtaque: 1500,
    dano: 60,
    projetilTextura: 'cannonball',
    projetilVelocidade: 300,
    projetilEscala: 1,
    corDestaque: 0x9a8a7a,
  },
  ballista: {
    tipo: 'ballista',
    textura: 'tower_ballista',
    nome: 'Balista',
    custo: 100,
    alcance: 280,
    intervaloAtaque: 1200,
    dano: 40,
    projetilTextura: 'arrow',
    projetilVelocidade: 600,
    projetilEscala: 1.5,
    corDestaque: 0x8b5a2b,
  },
  mage: {
    tipo: 'mage',
    textura: 'tower_mage',
    nome: 'Torre Mágica',
    custo: 150,
    alcance: 240,
    intervaloAtaque: 1000,
    dano: 25,
    projetilTextura: 'magic_bolt',
    projetilVelocidade: 500,
    projetilEscala: 1,
    corDestaque: 0x9b59b6,
  },
};

export default class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.scene = scene;
    this.config = config;
    this.tipo = config.tipo;
    this.nome = config.nome;
    this.alcance = config.alcance;
    this.intervaloAtaque = config.intervaloAtaque;
    this.dano = config.dano;
    this.ultimoTiro = 0;

    // Sprite da torre
    this.sprite = scene.add.image(0, 0, config.textura);
    this.sprite.setDisplaySize(64, 64);
    this.add(this.sprite);

    // Sombra
    const sombra = scene.add.ellipse(0, 28, 50, 12, 0x000000, 0.4);
    this.add(sombra);
    this.sprite.setDepth(1);
    sombra.setDepth(0);

    // Adiciona à cena (sem physics - colisão por distância)
    scene.add.existing(this);

    // Animação de "respiração"
    scene.tweens.add({
      targets: this.sprite,
      scaleX: { from: 1, to: 1.03 },
      scaleY: { from: 1, to: 0.97 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Encontra o inimigo mais próximo dentro do alcance.
   */
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

  /**
   * Ataca o inimigo mais próximo se o cooldown terminou.
   */
  tentarAtacar(time) {
    if (time - this.ultimoTiro < this.intervaloAtaque) return;
    const alvo = this.inimigoMaisProximo();
    if (!alvo) return;
    this.ultimoTiro = time;

    // Cria o projétil
    if (this.scene.criarProjetilTorre) {
      this.scene.criarProjetilTorre(this.x, this.y - 10, alvo, this.dano, this.config);
    }

    // Flash de tiro
    this.sprite.setTint(0xfff0a0);
    this.scene.time.delayedCall(80, () => {
      if (this.sprite && this.sprite.active) this.sprite.clearTint();
    });
  }

  update(time) {
    this.tentarAtacar(time);
  }
}
