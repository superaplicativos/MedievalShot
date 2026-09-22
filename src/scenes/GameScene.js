// ============================================================
// Medieval Kingshot - GameScene (Engine estilo Kingshot)
// ============================================================
// Mecânica:
//   1. Herói controlado por mouse/toque (clique e segure)
//   2. Ataque automático quando parado
//   3. Inimigos surgem em ondas em direção ao castelo
//   4. Inimigos dropam moedas ao morrer
//   5. Herói coleta moedas automaticamente ao passar por cima
//   6. Zonas de construção (build zones) no mapa
//   7. Herói caminha até a zona e deposita moedas
//   8. Quando atinge o custo, torre é construída
//   9. Torres atacam sozinhas
//  10. Defenda o castelo o máximo de tempo possível!
// ============================================================

import Phaser from 'phaser';
import Hero from '../objects/Hero.js';
import Enemy, { TIPOS_INIMIGO } from '../objects/Enemy.js';
import Tower, { TIPOS_TORRE } from '../objects/Tower.js';
import Projectile from '../objects/Projectile.js';
import Coin from '../objects/Coin.js';
import BuildZone from '../objects/BuildZone.js';
import Castle from '../objects/Castle.js';
import { submeterScore, getUsuarioAtual } from '../firebase.js';

// Configurações
const CONFIG = {
  // Castelo (base principal)
  casteloHp: 200,
  casteloX: 640,   // centro da arena (horizontal)
  casteloY: 700,   // embaixo da arena (mas visível)

  // Herói
  heroiStartX: 640,
  heroiStartY: 500,

  // Ondas
  intervaloOnda: 15000, // 15s entre ondas
  inimigosPorOnda: [8, 12, 16, 20, 25, 30, 35], // cresce a cada onda
  inimigoIntervalo: 1500, // 1.5s entre spawns
  tipoInimigoPorOnda: ['goblin', 'goblin', 'goblin', 'ogro', 'goblin', 'ogro', 'ogroBlindado'],

  // Build zones (posições fixas no mapa)
  buildZones: [
    { x: 400, y: 400, tipoTorre: 'archer' },
    { x: 880, y: 400, tipoTorre: 'archer' },
    { x: 300, y: 600, tipoTorre: 'cannon' },
    { x: 980, y: 600, tipoTorre: 'cannon' },
    { x: 640, y: 350, tipoTorre: 'ballista' },
    { x: 200, y: 500, tipoTorre: 'mage' },
    { x: 1080, y: 500, tipoTorre: 'mage' },
  ],
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    console.log('[GameScene] Iniciando engine estilo Kingshot');

    this.tempoInicio = this.time.now;
    this.ondaAtual = 0;
    this.kills = 0;
    this.moedasInventario = 30; // começa com 30 moedas para poder construir
    this.scoreFase = 0;
    this.jogoEncerrado = false;
    this.inimigosVivos = 0;

    // ============================================================
    // CENÁRIO DE FUNDO
    // ============================================================
    this.criarCenario();

    // ============================================================
    // GRUPOS DE OBJETOS
    // ============================================================
    this.inimigos = this.physics.add.group();
    this.projeteisHeroi = this.physics.add.group();
    this.projeteisTorres = this.physics.add.group();
    this.moedas = this.physics.add.group();
    this.torres = this.physics.add.group();
    this.buildZones = this.physics.add.group();

    // ============================================================
    // CASTELO (base principal)
    // ============================================================
    this.castelo = new Castle(this, CONFIG.casteloX, CONFIG.casteloY);

    // ============================================================
    // HERÓI (controlado pelo jogador)
    // ============================================================
    this.heroi = new Hero(this, CONFIG.heroiStartX, CONFIG.heroiStartY);

    // ============================================================
    // BUILD ZONES (zonas de construção)
    // ============================================================
    this.buildZonesList = [];
    CONFIG.buildZones.forEach((bz) => {
      const configTorre = TIPOS_TORRE[bz.tipoTorre];
      const zona = new BuildZone(this, bz.x, bz.y, {
        tipoTorre: bz.tipoTorre,
        custo: configTorre.custo,
        texturaTorre: configTorre.textura,
      });
      this.buildZones.add(zona);
      this.buildZonesList.push(zona);
    });

    // ============================================================
    // COLISÕES
    // ============================================================
    // Herói vs Build Zones (detectar entrada/saída)
    this.physics.add.overlap(this.heroi, this.buildZones, (heroi, zona) => {
      if (zona.ativa) zona.heroiEntrou();
    });

    // Projéteis do herói vs Inimigos
    this.physics.add.overlap(this.projeteisHeroi, this.inimigos, (flecha, inimigo) => {
      if (!flecha.active || !inimigo.active) return;
      flecha.bater(inimigo);
    });

    // Projéteis das torres vs Inimigos
    this.physics.add.overlap(this.projeteisTorres, this.inimigos, (projetil, inimigo) => {
      if (!projetil.active || !inimigo.active) return;
      projetil.bater(inimigo);
    });

    // Inimigos vs Castelo (causam dano ao chegar)
    this.physics.add.overlap(this.inimigos, this.castelo, (inimigo, castelo) => {
      if (inimigo.estaMorto) return;
      inimigo.baterNoCastelo();
    });

    // ============================================================
    // CONTROLES (mouse + toque)
    // ============================================================
    this.criarControles();

    // ============================================================
    // HUD
    // ============================================================
    this.criarHUD();

    // ============================================================
    // PRIMEIRA ONDA
    // ============================================================
    this.iniciarProximaOnda();

    // ============================================================
    // TEXTOS INTRODUTÓRIOS
    // ============================================================
    this.mostrarIntro();
  }

  // ============================================================
  // CENÁRIO (fundo da arena)
  // ============================================================
  criarCenario() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Fundo: gradiente (campo verde)
    const fundo = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t = y / H;
      const r = Math.floor(40 + (20 - 40) * t);
      const g = Math.floor(80 + (40 - 80) * t);
      const b = Math.floor(40 + (20 - 40) * t);
      fundo.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      fundo.fillRect(0, y, W, 1);
    }

    // Textura de grama (xadrez sutil)
    const grama = this.add.graphics();
    grama.fillStyle(0x4a7a3a, 0.3);
    for (let x = 0; x < W; x += 100) {
      for (let y = 0; y < H; y += 100) {
        if ((x / 100 + y / 100) % 2 === 0) {
          grama.fillRect(x, y, 100, 100);
        }
      }
    }

    // Caminho (estrada de terra do topo até o castelo)
    const caminho = this.add.graphics();
    caminho.fillStyle(0x8b6f4a, 0.5);
    caminho.fillRect(W / 2 - 60, 0, 120, H);
    caminho.fillStyle(0x6b4423, 0.3);
    caminho.fillRect(W / 2 - 40, 0, 80, H);
    // Manchas no caminho
    caminho.fillStyle(0x5a3a20, 0.4);
    for (let y = 0; y < H; y += 30) {
      caminho.fillCircle(W / 2 + Phaser.Math.Between(-30, 30), y, 5);
    }

    // Pedras decorativas
    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(50, W - 50);
      const y = Phaser.Math.Between(100, H - 100);
      // Não colocar pedras no caminho
      if (Math.abs(x - W / 2) < 80) continue;
      const pedra = this.add.graphics();
      pedra.fillStyle(0x808080, 0.7);
      pedra.fillCircle(x, y, Phaser.Math.Between(8, 16));
      pedra.fillStyle(0xa0a0a0, 0.4);
      pedra.fillCircle(x - 2, y - 2, Phaser.Math.Between(5, 10));
    }

    // Árvores decorativas nos cantos
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(30, W - 30);
      const y = Phaser.Math.Between(50, H - 100);
      if (Math.abs(x - W / 2) < 100) continue;
      this.criarArvore(x, y);
    }

    // Borda
    const borda = this.add.graphics();
    borda.lineStyle(8, 0x3a2410, 0.8);
    borda.strokeRect(4, 4, W - 8, H - 8);
  }

  criarArvore(x, y) {
    // Copa
    const copa = this.add.graphics();
    copa.fillStyle(0x2a5a1a, 0.8);
    copa.fillCircle(x, y, 16);
    copa.fillStyle(0x3a7a2a, 0.8);
    copa.fillCircle(x - 4, y - 4, 12);
    copa.fillStyle(0x4a8a3a, 0.6);
    copa.fillCircle(x - 6, y - 6, 8);
    // Tronco
    copa.fillStyle(0x4a2e15, 1);
    copa.fillRect(x - 3, y + 8, 6, 8);
    // Sombra
    copa.fillStyle(0x000000, 0.3);
    copa.fillEllipse(x, y + 18, 24, 6);
  }

  // ============================================================
  // CONTROLES
  // ============================================================
  criarControles() {
    // Mouse: clicar e segurar para mover
    this.input.on('pointerdown', (pointer) => {
      this.pointerAtivo = true;
      this.heroi.moverPara(pointer.worldX, pointer.worldY);
    });

    this.input.on('pointermove', (pointer) => {
      if (this.pointerAtivo && pointer.isDown) {
        this.heroi.moverPara(pointer.worldX, pointer.worldY);
      }
    });

    this.input.on('pointerup', () => {
      this.pointerAtivo = false;
      this.heroi.parar();
    });

    // Teclado (WASD/setas) - opcional para PC
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });
  }

  // ============================================================
  // ONDAS DE INIMIGOS
  // ============================================================
  iniciarProximaOnda() {
    if (this.jogoEncerrado) return;

    this.ondaAtual++;
    console.log(`[GameScene] Iniciando onda ${this.ondaAtual}`);

    const configOnda = this.getConfigOnda(this.ondaAtual);
    this.inimigosParaSpawnar = configOnda.quantidade;
    this.inimigosSpawndos = 0;
    this.tipoInimigoOnda = configOnda.tipo;

    // Texto de aviso
    this.mostrarAvisoOnda(this.ondaAtual, configOnda.quantidade);

    // Inicia o spawner
    this.spawner = this.time.addEvent({
      delay: CONFIG.inimigoIntervalo,
      callback: this.spawnarInimigo,
      callbackScope: this,
      repeat: configOnda.quantidade - 1,
    });

    // Agenda próxima onda
    const duracaoOnda = configOnda.quantidade * CONFIG.inimigoIntervalo + 5000;
    this.time.delayedCall(duracaoOnda, () => {
      if (!this.jogoEncerrado) this.iniciarProximaOnda();
    });
  }

  getConfigOnda(onda) {
    const idx = Math.min(onda - 1, CONFIG.inimigosPorOnda.length - 1);
    const quantidade = CONFIG.inimigosPorOnda[idx];
    const tipo = CONFIG.tipoInimigoPorOnda[idx] || 'ogroBlindado';
    return { quantidade, tipo };
  }

  spawnarInimigo() {
    if (this.jogoEncerrado) return;
    const configInimigo = TIPOS_INIMIGO[this.tipoInimigoOnda];
    const x = CONFIG.casteloX + Phaser.Math.Between(-300, 300);
    const y = -50;
    const inimigo = new Enemy(this, x, y, configInimigo);
    this.inimigos.add(inimigo);
    inimigo.moverPara(this.castelo);
  }

  mostrarAvisoOnda(onda, quantidade) {
    const W = this.scale.width;
    const texto = this.add.text(W / 2, 200, `ONDA ${onda}\n${quantidade} inimigos`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6,
      align: 'center',
    }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: texto,
      alpha: 1,
      duration: 400,
      yoyo: true,
      hold: 1500,
      onComplete: () => texto.destroy(),
    });
  }

  // ============================================================
  // MÉTODOS CHAMADOS PELOS OBJETOS
  // ============================================================

  /**
   * Cria um projétil do herói (chamado por Hero.js).
   */
  criarProjetilHeroi(x, y, alvo, dano) {
    const flecha = new Projectile(this, x, y, alvo, dano, {
      projetilTextura: 'arrow',
      projetilVelocidade: 500,
      projetilEscala: 1,
    });
    this.projeteisHeroi.add(flecha);
  }

  /**
   * Cria um projétil de uma torre (chamado por Tower.js).
   */
  criarProjetilTorre(x, y, alvo, dano, configTorre) {
    const projetil = new Projectile(this, x, y, alvo, dano, configTorre);
    this.projeteisTorres.add(projetil);
  }

  /**
   * Dropa moedas no chão (chamado por Enemy.js quando morre).
   */
  droparMoedas(x, y, quantidade) {
    for (let i = 0; i < quantidade; i++) {
      const moeda = new Coin(this, x, y);
      this.moedas.add(moeda);
    }
  }

  /**
   * Coleta uma moeda (chamado por Hero.js quando passa por cima).
   */
  coletarMoeda(moeda) {
    if (!moeda.active) return;
    this.moedasInventario++;
    this.scoreFase += 5;
    moeda.destroy();

    // Efeito visual: texto +1
    const texto = this.add.text(moeda.x, moeda.y - 10, '+1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff0a0',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);

    this.tweens.add({
      targets: texto,
      y: texto.y - 30,
      alpha: 0,
      duration: 600,
      onComplete: () => texto.destroy(),
    });

    this.atualizarHUD();
  }

  /**
   * Chamado quando um inimigo é morto.
   */
  onEnemyKilled(inimigo) {
    this.kills++;
    this.scoreFase += inimigo.recompensaScore || 10;
    this.atualizarHUD();
  }

  /**
   * Chamado quando o castelo é destruído.
   */
  onDerrota() {
    if (this.jogoEncerrado) return;
    this.jogoEncerrado = true;
    if (this.spawner) this.spawner.remove();

    this.submeterResultado();
  }

  /**
   * Submete o score ao ranking.
   */
  async submeterResultado() {
    const tempoSobrevivencia = this.time.now - this.tempoInicio;
    const resultado = {
      scoreGanho: this.scoreFase,
      kills: this.kills,
      tempoSobrevivenciaMs: tempoSobrevivencia,
      level: 1,
      coins: this.moedasInventario,
    };

    try {
      const { novoScoreTotal, posicaoRanking } = await submeterScore(resultado);
      this.ultimoResultado = { scoreGanho: this.scoreFase, novoScoreTotal, posicaoRanking, venceu: false };
      this.mostrarTelaFim();
    } catch (e) {
      this.ultimoResultado = { scoreGanho: this.scoreFase, novoScoreTotal: 0, posicaoRanking: -1, venceu: false };
      this.mostrarTelaFim();
    }
  }

  // ============================================================
  // HUD
  // ============================================================
  criarHUD() {
    const W = this.scale.width;

    // Painel de madeira no topo
    const painelTopo = this.add.image(W / 2, 30, 'painel_madeira').setDisplaySize(W - 40, 60).setDepth(50);

    // ----- Moedas (esquerda) -----
    const moedasContainer = this.add.container(80, 30).setDepth(51);
    moedasContainer.add(this.add.image(0, 0, 'icon_moeda').setScale(0.9));
    this.hudMoedas = this.add.text(20, 0, '0', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fff0a0',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    moedasContainer.add(this.hudMoedas);

    // ----- HP do castelo (centro-esquerda) -----
    const hpContainer = this.add.container(280, 30).setDepth(51);
    hpContainer.add(this.add.image(0, 0, 'icon_escudo').setScale(0.9));
    this.hudHp = this.add.text(20, 0, `${this.castelo.hp}/${this.castelo.maxHp}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    hpContainer.add(this.hudHp);

    // ----- Onda atual (centro) -----
    const ondaContainer = this.add.container(W / 2, 30).setDepth(51);
    ondaContainer.add(this.add.image(-50, 0, 'icon_espada').setScale(0.8));
    this.hudOnda = this.add.text(0, 0, 'Onda 1', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#d4a544',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    ondaContainer.add(this.hudOnda);

    // ----- Kills (centro-direita) -----
    const killsContainer = this.add.container(W - 320, 30).setDepth(51);
    killsContainer.add(this.add.image(0, 0, 'icon_caveira').setScale(0.9));
    this.hudKills = this.add.text(20, 0, '0', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5e6c8',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    killsContainer.add(this.hudKills);

    // ----- Tempo (direita) -----
    const tempoContainer = this.add.container(W - 130, 30).setDepth(51);
    tempoContainer.add(this.add.image(0, 0, 'icon_relogio').setScale(0.9));
    this.hudTempo = this.add.text(20, 0, '0s', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5e6c8',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    tempoContainer.add(this.hudTempo);

    // Botão Menu (canto inferior direito)
    const btnMenuContainer = this.add.container(W - 80, this.scale.height - 30).setDepth(100);
    const btnMenuFundo = this.add.image(0, 0, 'btn_madeira_peq').setDisplaySize(140, 36);
    btnMenuContainer.add(btnMenuFundo);
    btnMenuContainer.add(this.add.text(0, 0, 'MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0.5));
    btnMenuFundo.setInteractive({ useHandCursor: true });
    btnMenuFundo.on('pointerover', () => btnMenuFundo.setTint(0xcc6666));
    btnMenuFundo.on('pointerout', () => btnMenuFundo.clearTint());
    btnMenuFundo.on('pointerdown', () => {
      if (confirm('Voltar ao menu? Seu progresso atual será perdido.')) {
        this.scene.start('MenuScene');
      }
    });

    this.atualizarHUD();
  }

  atualizarHUD() {
    if (this.hudMoedas) this.hudMoedas.setText(`${this.moedasInventario}`);
    if (this.hudHp && this.castelo) {
      this.hudHp.setText(`${this.castelo.hp}/${this.castelo.maxHp}`);
      const pct = this.castelo.hp / this.castelo.maxHp;
      if (pct > 0.5) this.hudHp.setColor('#2ecc71');
      else if (pct > 0.25) this.hudHp.setColor('#f1c40f');
      else this.hudHp.setColor('#e74c3c');
    }
    if (this.hudKills) this.hudKills.setText(`${this.kills}`);
    if (this.hudOnda) this.hudOnda.setText(`Onda ${this.ondaAtual}`);
  }

  // ============================================================
  // INTRODUÇÃO
  // ============================================================
  mostrarIntro() {
    const W = this.scale.width;
    const H = this.scale.height;

    const intro = this.add.text(W / 2, H / 2 - 100,
      'DEFENDA SEU CASTELO!\nClique e segure para mover o herói\nConstrua torres nas zonas douradas', {
        fontFamily: 'Cinzel, serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: '#fff0a0',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center',
      }).setOrigin(0.5).setAlpha(0).setDepth(100);

    this.tweens.add({
      targets: intro,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 3000,
      onComplete: () => intro.destroy(),
    });
  }

  // ============================================================
  // TELA DE FIM DE JOGO
  // ============================================================
  mostrarTelaFim() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.container(W / 2, H / 2);
    overlay.setDepth(200);

    const fundo = this.add.rectangle(0, 0, W, H, 0x000000, 0.85);
    overlay.add(fundo);

    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(640, 520);
    overlay.add(painel);

    overlay.add(this.add.text(0, -200, 'CASTELO CAIU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#e74c3c',
      stroke: '#000000',
      strokeThickness: 6,
    }).setOrigin(0.5));

    const tempoSeg = ((this.time.now - this.tempoInicio) / 1000).toFixed(0);
    overlay.add(this.add.text(0, -130,
      `Você resistiu por ${tempoSeg}s\nKills: ${this.kills}\nOndas sobrevividas: ${this.ondaAtual - 1}\nMoedas: ${this.moedasInventario}`, {
        fontFamily: 'MedievalSharp, serif',
        fontSize: '18px',
        color: '#5a3a20',
        align: 'center',
        lineSpacing: 4,
      }).setOrigin(0.5));

    // Score
    if (this.ultimoResultado) {
      overlay.add(this.add.text(0, 0, `Score ganho: +${this.ultimoResultado.scoreGanho} pontos`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#2ecc71',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(0.5));

      if (this.ultimoResultado.posicaoRanking > 0) {
        overlay.add(this.add.text(0, 40,
          `Sua posição no ranking: #${this.ultimoResultado.posicaoRanking}`, {
            fontFamily: 'Cinzel, serif',
            fontSize: '16px',
            color: '#9b59b6',
            stroke: '#000000',
            strokeThickness: 2,
          }).setOrigin(0.5));
      }
    }

    // Botões
    const btnRanking = this.add.image(0, 120, 'btn_madeira').setDisplaySize(320, 50);
    btnRanking.setInteractive({ useHandCursor: true });
    btnRanking.on('pointerover', () => btnRanking.setTint(0x9b59b6));
    btnRanking.on('pointerout', () => btnRanking.clearTint());
    btnRanking.on('pointerdown', () => this.scene.start('RankingScene'));
    overlay.add(btnRanking);
    overlay.add(this.add.text(0, 120, 'VER RANKING', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0.5));

    const btnJogar = this.add.image(0, 185, 'btn_madeira').setDisplaySize(320, 50);
    btnJogar.setInteractive({ useHandCursor: true });
    btnJogar.on('pointerover', () => btnJogar.setTint(0x2ecc71));
    btnJogar.on('pointerout', () => btnJogar.clearTint());
    btnJogar.on('pointerdown', () => this.scene.restart());
    overlay.add(btnJogar);
    overlay.add(this.add.text(0, 185, 'JOGAR NOVAMENTE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0.5));

    const btnMenu = this.add.image(0, 240, 'btn_madeira').setDisplaySize(320, 50);
    btnMenu.setInteractive({ useHandCursor: true });
    btnMenu.on('pointerover', () => btnMenu.setTint(0x7f8c8d));
    btnMenu.on('pointerout', () => btnMenu.clearTint());
    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
    overlay.add(btnMenu);
    overlay.add(this.add.text(0, 240, 'MENU PRINCIPAL', {
      fontFamily: 'Cinzel, serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0.5));
  }

  // ============================================================
  // UPDATE
  // ============================================================
  update(time) {
    if (this.jogoEncerrado) return;

    // Atualiza herói
    if (this.heroi) this.heroi.update(time);

    // Atualiza torres
    if (this.torres) {
      this.torres.getChildren().forEach((torre) => {
        if (torre.update) torre.update(time);
      });
    }

    // Atualiza inimigos
    if (this.inimigos) {
      this.inimigos.getChildren().forEach((inimigo) => {
        if (inimigo.update) inimigo.update(time);
      });
    }

    // Atualiza build zones
    if (this.buildZonesList) {
      this.buildZonesList.forEach((zona) => {
        if (zona.active && zona.ativa) {
          // Verifica se herói ainda está na zona (overlap contínuo)
          if (zona.heroiDentro) {
            const dist = Phaser.Math.Distance.Between(this.heroi.x, this.heroi.y, zona.x, zona.y);
            if (dist > 40) {
              zona.heroiSaiu();
            } else {
              zona.update(time);
            }
          }
        }
      });
    }

    // Atualiza HUD de tempo
    const decorrido = (time - this.tempoInicio) / 1000;
    if (this.hudTempo) this.hudTempo.setText(`${decorrido.toFixed(0)}s`);
  }
}
