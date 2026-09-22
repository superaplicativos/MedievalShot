// ============================================================
// Medieval Kingshot - BuildZone (Zona de Construção)
// ============================================================
// Estilo Kingshot: quadrado tracejado no chão. O herói precisa
// caminhar até ele e depositar moedas. Quando atinge o custo,
// a torre é construída automaticamente.
// (Sem physics body - detecção por distância na GameScene)
// ============================================================

import Phaser from 'phaser';
import Tower, { TIPOS_TORRE } from './Tower.js';

export default class BuildZone extends Phaser.GameObjects.Container {
  constructor(scene, x, y, config) {
    super(scene, x, y);
    this.scene = scene;
    this.config = config;
    this.tipoTorre = config.tipoTorre;
    this.custo = config.custo;
    this.depositado = 0;
    this.ativa = true;
    this.heroiDentro = false;
    this.ultimoDeposito = 0;
    this.raioColeta = 50;

    // Sprite da zona
    this.sprite = scene.add.image(0, 0, 'buildzone').setDisplaySize(80, 80);
    this.add(this.sprite);

    // Ícone da torre no centro (prévia do que vai ser construído)
    this.iconeTorre = scene.add.image(0, -8, config.texturaTorre).setDisplaySize(40, 40);
    this.iconeTorre.setAlpha(0.7);
    this.add(this.iconeTorre);

    // Texto com o custo
    this.textoCusto = scene.add
      .text(0, 22, `${this.custo}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fff0a0',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    this.add(this.textoCusto);

    // Ícone de moeda ao lado do custo
    this.iconeMoeda = scene.add.image(-12, 22, 'icon_moeda').setScale(0.5);
    this.add(this.iconeMoeda);

    // Adiciona à cena
    scene.add.existing(this);

    // Animação pulsante
    scene.tweens.add({
      targets: this.sprite,
      alpha: { from: 0.7, to: 1 },
      scaleX: { from: 1, to: 1.05 },
      scaleY: { from: 1, to: 1.05 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  /**
   * Verifica se o herói está dentro da zona (por distância).
   */
  verificarHeroi(heroi) {
    if (!this.ativa) return;
    const dist = Phaser.Math.Distance.Between(heroi.x, heroi.y, this.x, this.y);
    if (dist < this.raioColeta) {
      if (!this.heroiDentro) {
        this.heroiEntrou();
      }
      return true;
    } else {
      if (this.heroiDentro) {
        this.heroiSaiu();
      }
      return false;
    }
  }

  heroiEntrou() {
    this.heroiDentro = true;
    this.sprite.setTint(0xfff0a0);
  }

  heroiSaiu() {
    this.heroiDentro = false;
    this.sprite.clearTint();
  }

  /**
   * Deposita moedas na zona (chamado a cada 100ms quando herói está dentro).
   * @returns {boolean} true se a torre foi construída
   */
  depositar(time) {
    if (!this.ativa || !this.heroiDentro) return false;
    if (time - this.ultimoDeposito < 100) return false;
    if (this.scene.moedasInventario < 1) return false;

    this.ultimoDeposito = time;
    this.scene.moedasInventario--;
    this.depositado++;

    // Atualiza texto com progresso
    const restante = this.custo - this.depositado;
    this.textoCusto.setText(`${Math.max(0, restante)}`);

    // Pequena animação
    this.scene.tweens.add({
      targets: this.iconeMoeda,
      scaleX: { from: 0.5, to: 0.7 },
      scaleY: { from: 0.5, to: 0.7 },
      duration: 100,
      yoyo: true,
    });

    if (this.scene.atualizarHUD) this.scene.atualizarHUD();

    if (this.depositado >= this.custo) {
      this.construirTorre();
      return true;
    }
    return false;
  }

  construirTorre() {
    this.ativa = false;

    // Efeito visual: explosão dourada
    const explosao = this.scene.add.circle(this.x, this.y, 10, 0xfff0a0);
    this.scene.tweens.add({
      targets: explosao,
      radius: 50,
      alpha: 0,
      duration: 400,
      ease: 'Quad.out',
      onComplete: () => explosao.destroy(),
    });

    // Cria a torre
    const configTorre = TIPOS_TORRE[this.tipoTorre];
    const torre = new Tower(this.scene, this.x, this.y, configTorre);
    if (this.scene.torres) this.scene.torres.add(torre);

    // Remove a zona de construção
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }

  update(time) {
    if (this.ativa && this.heroiDentro) {
      this.depositar(time);
    }
  }
}
