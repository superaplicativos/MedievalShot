// ============================================================
// Medieval Kingshot - BuildZone (Zona de Construção)
// ============================================================
// Estilo Kingshot: quadrado tracejado no chão. O herói precisa
// caminhar até ele e depositar moedas. Quando atinge o custo,
// a torre é construída automaticamente.
//
// Mecânica:
//   - Hero entra na zona: começa a "depositar" moedas
//   - A cada 100ms, 1 moeda é transferida do inventário para a zona
//   - Quando o total depositado >= custo, a torre é construída
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

    // Sprite da zona
    this.sprite = scene.add.image(0, 0, 'buildzone').setDisplaySize(64, 64);
    this.add(this.sprite);

    // Ícone da torre no centro (prévia do que vai ser construído)
    this.iconeTorre = scene.add.image(0, -8, config.texturaTorre).setDisplaySize(32, 32);
    this.iconeTorre.setAlpha(0.7);
    this.add(this.iconeTorre);

    // Texto com o custo
    this.textoCusto = scene.add
      .text(0, 18, `${this.custo}`, {
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
    this.iconeMoeda = scene.add.image(-12, 18, 'icon_moeda').setScale(0.5);
    this.add(this.iconeMoeda);

    // Adiciona à cena
    scene.add.existing(this);

    // Hitbox para detectar herói
    scene.physics.add.existing(this, true);
    this.body.setSize(50, 50);
    this.body.setOffset(-25, -25);

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
   * Chamado quando o herói entra na zona.
   */
  heroiEntrou() {
    this.heroiDentro = true;
    // Highlight da zona
    this.sprite.setTint(0xfff0a0);
  }

  /**
   * Chamado quando o herói sai da zona.
   */
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

    // Pequena animação de "engolir" a moeda
    this.scene.tweens.add({
      targets: this.iconeMoeda,
      scaleX: { from: 0.5, to: 0.7 },
      scaleY: { from: 0.5, to: 0.7 },
      duration: 100,
      yoyo: true,
    });

    if (this.scene.atualizarHUD) this.scene.atualizarHUD();

    // Verifica se atingiu o custo
    if (this.depositado >= this.custo) {
      this.construirTorre();
      return true;
    }
    return false;
  }

  /**
   * Constrói a torre e desativa a zona.
   */
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
