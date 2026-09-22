// ============================================================
// Medieval Kingshot - MenuScene (Formato Horizontal 16:9)
// ============================================================
// Menu principal adaptado para resolução 1280x720.
// Mesma estética medieval mas layout horizontal.
// ============================================================

import Phaser from 'phaser';
import { loginAnonimo, carregarProgresso, firebaseConfigurado, setNickname } from '../firebase.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  async create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.criarCenarioFundo();
    this.criarTitulo(W, H);
    this.criarStatusBadge(W, H);

    // Login + carregar progresso
    this.mostrarCarregando('Conectando ao reino...');
    try {
      await loginAnonimo();
      this.progresso = await carregarProgresso();
      if (!this.progresso) {
        this.progresso = { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
      }
    } catch (e) {
      this.progresso = { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
    }
    this.esconderCarregando();

    this.renderizarCardProgresso(W, H);

    // Botões
    this.criarBotaoMedieval(W / 2, H / 2 + 60, 'icon_espada', 'JOGAR', 0x2ecc71, () => {
      this.scene.start('GameScene');
    });

    this.criarBotaoMedieval(W / 2, H / 2 + 130, 'icon_trofeu', 'RANKING GLOBAL', 0x9b59b6, () => {
      this.scene.start('RankingScene');
    });

    this.criarBotaoMedieval(W / 2, H / 2 + 200, 'icon_coroa', 'EDITAR NICKNAME', 0xf39c12, () => {
      this.editarNickname();
    });

    this.criarBotaoMedieval(W / 2, H / 2 + 270, 'icon_pergaminho', 'COMO JOGAR', 0x7f8c8d, () => {
      this.mostrarAjuda();
    });

    // Rodapé
    this.add.text(W / 2, H - 20, 'Medieval Kingshot - Single-Player Tower Defense', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#8a7050',
    }).setOrigin(0.5);
  }

  criarCenarioFundo() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Gradiente céu noturno
    const fundo = this.add.graphics();
    for (let y = 0; y < H; y++) {
      const t = y / H;
      let r, g, b;
      if (t < 0.5) {
        const tt = t * 2;
        r = Math.floor(15 + (60 - 15) * tt);
        g = Math.floor(10 + (30 - 10) * tt);
        b = Math.floor(35 + (90 - 35) * tt);
      } else {
        const tt = (t - 0.5) * 2;
        r = Math.floor(25 + (10 - 25) * tt);
        g = Math.floor(20 + (8 - 20) * tt);
        b = Math.floor(60 + (15 - 60) * tt);
      }
      fundo.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      fundo.fillRect(0, y, W, 1);
    }

    // Estrelas
    for (let i = 0; i < 80; i++) {
      const estrela = this.add.circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H / 2),
        Phaser.Math.Between(0.5, 2),
        0xfff0a0,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
      this.tweens.add({
        targets: estrela,
        alpha: 0.2,
        duration: Phaser.Math.Between(1500, 3500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }

    // Lua
    this.add.circle(W - 130, 110, 36, 0xf5e6c8, 0.9).setStrokeStyle(2, 0xd4a544, 0.4);
    this.add.circle(W - 130, 110, 60, 0xfff0a0, 0.1);

    // Montanhas
    const montanhas = this.add.graphics();
    montanhas.fillStyle(0x1a0f15, 0.7);
    montanhas.beginPath();
    montanhas.moveTo(0, H - 100);
    for (let x = 0; x <= W; x += 50) {
      const y = H - 100 - Math.sin(x * 0.008) * 40 - Math.random() * 12;
      montanhas.lineTo(x, y);
    }
    montanhas.lineTo(W, H);
    montanhas.lineTo(0, H);
    montanhas.closePath();
    montanhas.fillPath();

    montanhas.fillStyle(0x0d0805, 0.9);
    montanhas.beginPath();
    montanhas.moveTo(0, H - 50);
    for (let x = 0; x <= W; x += 40) {
      const y = H - 50 - Math.sin(x * 0.02 + 1) * 30 - Math.random() * 10;
      montanhas.lineTo(x, y);
    }
    montanhas.lineTo(W, H);
    montanhas.lineTo(0, H);
    montanhas.closePath();
    montanhas.fillPath();

    // Castelo ao fundo
    this.add.image(W / 2, H - 80, 'decor_castelo').setScale(2.5).setAlpha(0.3);

    // Bandeiras decorativas
    this.add.image(120, 140, 'decor_bandeira').setScale(1).setAlpha(0.8);
    this.add.image(W - 120, 140, 'decor_bandeira').setScale(1).setFlipX(true).setAlpha(0.8);

    // Brasões
    this.add.image(80, H - 100, 'decor_brasao').setScale(0.6).setAlpha(0.6);
    this.add.image(W - 80, H - 100, 'decor_brasao').setScale(0.6).setAlpha(0.6);
  }

  criarTitulo(W, H) {
    // Sombra
    this.add.text(W / 2 + 4, 100 + 4, 'MEDIEVAL KINGSHOT', {
      fontFamily: 'Cinzel, serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#000000',
    }).setOrigin(0.5).setAlpha(0.6);

    const titulo = this.add.text(W / 2, 100, 'MEDIEVAL KINGSHOT', {
      fontFamily: 'Cinzel, serif',
      fontSize: '64px',
      fontStyle: 'bold',
      color: '#d4a544',
      stroke: '#3a2410',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(W / 2, 155, 'Tower Defense Medieval', {
      fontFamily: 'MedievalSharp, serif',
      fontSize: '20px',
      color: '#9a8a6a',
    }).setOrigin(0.5);

    // Linha decorativa
    const linha = this.add.graphics();
    linha.fillStyle(0xd4a544, 0.6);
    linha.fillRect(W / 2 - 200, 180, 400, 1);
    linha.fillStyle(0xd4a544, 1);
    linha.fillCircle(W / 2, 180, 4);
    linha.fillCircle(W / 2 - 220, 180, 3);
    linha.fillCircle(W / 2 + 220, 180, 3);

    this.tweens.add({
      targets: titulo,
      alpha: { from: 1, to: 0.85 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  criarStatusBadge(W, H) {
    const online = firebaseConfigurado;
    const badge = this.add.container(W - 130, 50);
    const fundo = this.add.rectangle(0, 0, 140, 32, 0x000000, 0.7);
    fundo.setStrokeStyle(1, online ? 0x2ecc71 : 0xe74c3c, 0.8);
    badge.add(fundo);
    const dot = this.add.circle(-50, 0, 6, online ? 0x2ecc71 : 0xe74c3c);
    badge.add(dot);
    this.tweens.add({ targets: dot, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    badge.add(this.add.text(-35, 0, online ? 'Online' : 'Offline', {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: online ? '#2ecc71' : '#e74c3c',
    }).setOrigin(0, 0.5));
  }

  renderizarCardProgresso(W, H) {
    if (this.cardProgresso) this.cardProgresso.destroy();
    this.cardProgresso = this.add.container(W / 2, 230);

    const painel = this.add.image(0, 0, 'painel_madeira').setDisplaySize(640, 70);
    this.cardProgresso.add(painel);

    const coroa = this.add.image(-280, 0, 'icon_coroa').setScale(1.2);
    this.cardProgresso.add(coroa);

    const nick = this.progresso.nickname || 'Guerreiro Anônimo';
    this.cardProgresso.add(this.add.text(-240, -14, nick, {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#d4a544',
    }).setOrigin(0, 0.5));

    // Stats com ícones
    let xOffset = -240;
    const statsY = 14;

    const stat1 = this.add.container(xOffset, statsY);
    stat1.add(this.add.image(0, 0, 'icon_escudo').setScale(0.6));
    stat1.add(this.add.text(16, 0, `${this.progresso.level || 1}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    this.cardProgresso.add(stat1);
    xOffset += 90;

    const stat2 = this.add.container(xOffset, statsY);
    stat2.add(this.add.image(0, 0, 'icon_moeda').setScale(0.6));
    stat2.add(this.add.text(16, 0, `${this.progresso.coins || 0}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    this.cardProgresso.add(stat2);
    xOffset += 100;

    const stat3 = this.add.container(xOffset, statsY);
    stat3.add(this.add.image(0, 0, 'icon_estrela').setScale(0.6));
    stat3.add(this.add.text(16, 0, `${this.progresso.score || 0} pts`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    this.cardProgresso.add(stat3);
    xOffset += 130;

    const stat4 = this.add.container(xOffset, statsY);
    stat4.add(this.add.image(0, 0, 'icon_caveira').setScale(0.6));
    stat4.add(this.add.text(16, 0, `${this.progresso.kills || 0}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    this.cardProgresso.add(stat4);
  }

  criarBotaoMedieval(x, y, iconeTexture, texto, corDestaque, callback) {
    const botao = this.add.container(x, y);
    const fundo = this.add.image(0, 0, 'btn_madeira');
    botao.add(fundo);
    const overlay = this.add.rectangle(0, 0, 360, 48, corDestaque, 0);
    botao.add(overlay);
    const icone = this.add.image(-150, 0, iconeTexture).setScale(1.1);
    botao.add(icone);
    const label = this.add.text(0, 0, texto, {
      fontFamily: 'Cinzel, serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f5e6c8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    botao.add(label);

    fundo.setInteractive({ useHandCursor: true });
    fundo.on('pointerover', () => {
      this.tweens.add({ targets: botao, scaleX: 1.04, scaleY: 1.04, duration: 100 });
      overlay.setFillStyle(corDestaque, 0.3);
      icone.setTint(0xfff0a0);
    });
    fundo.on('pointerout', () => {
      this.tweens.add({ targets: botao, scaleX: 1, scaleY: 1, duration: 100 });
      overlay.setFillStyle(corDestaque, 0);
      icone.clearTint();
    });
    fundo.on('pointerdown', () => {
      overlay.setFillStyle(0xffffff, 0.5);
      this.cameras.main.fadeOut(150, 0, 0, 0);
      this.time.delayedCall(150, callback);
    });
    return botao;
  }

  mostrarCarregando(msg = 'Carregando...') {
    this.esconderCarregando();
    this.loadingOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const fundo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85);
    const texto = this.add.text(0, 0, msg, {
      fontFamily: 'Cinzel, serif',
      fontSize: '24px',
      color: '#d4a544',
    }).setOrigin(0.5);
    this.loadingOverlay.add([fundo, texto]);
  }

  esconderCarregando() {
    if (this.loadingOverlay) {
      this.loadingOverlay.destroy();
      this.loadingOverlay = null;
    }
  }

  editarNickname() {
    const atual = this.progresso.nickname || '';
    const novo = prompt('Digite seu nickname (máx 16 caracteres):', atual);
    if (novo && novo.trim()) {
      setNickname(novo.trim()).then(() => {
        this.progresso.nickname = novo.trim().substring(0, 16);
        this.renderizarCardProgresso(this.scale.width, this.scale.height);
      });
    }
  }

  mostrarAjuda() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const W = this.scale.width;
    const H = this.scale.height;

    this.modalOverlay = this.add.container(W / 2, H / 2);
    const fundo = this.add.rectangle(0, 0, W, H, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);
    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(720, 560);
    this.modalOverlay.add(painel);

    this.modalOverlay.add(this.add.text(0, -220, 'COMO JOGAR', {
      fontFamily: 'Cinzel, serif',
      fontSize: '28px',
      fontStyle: 'bold',
      color: '#5a3a20',
    }).setOrigin(0.5));

    const linhas = [
      'CONTROLES',
      'PC: Clique e segure com o mouse para mover o herói',
      'Celular: Toque e segure na tela para mover o herói',
      '',
      'COMBATE',
      'O herói ataca automaticamente quando está parado',
      'Inimigos surgem em ondas em direção ao seu castelo',
      '',
      'ECONOMIA',
      'Mate inimigos para coletar moedas automaticamente',
      'Caminhe até as zonas douradas para construir torres',
      'Cada torre tem um custo (25, 60, 100 ou 150 moedas)',
      '',
      'TORRES',
      'Torre de Arqueiro: 25 moedas - ataques rápidos',
      'Canhão: 60 moedas - dano alto',
      'Balista: 100 moedas - longo alcance',
      'Torre Mágica: 150 moedas - dano mágico',
      '',
      'OBJETIVO',
      'Defenda seu castelo o máximo de tempo possível!',
      'Cada kill e cada vitória somam pontos no ranking global.',
    ];

    this.modalOverlay.add(this.add.text(0, 0, linhas.join('\n'), {
      fontFamily: 'MedievalSharp, serif',
      fontSize: '15px',
      color: '#5a3a20',
      align: 'center',
      lineSpacing: 3,
    }).setOrigin(0.5));

    // Botão fechar
    const btnFundo = this.add.image(0, 230, 'btn_madeira_peq').setDisplaySize(220, 44);
    btnFundo.setInteractive({ useHandCursor: true });
    btnFundo.on('pointerover', () => btnFundo.setTint(0xcc6666));
    btnFundo.on('pointerout', () => btnFundo.clearTint());
    btnFundo.on('pointerdown', () => this.modalOverlay.destroy());
    this.modalOverlay.add(btnFundo);
    this.modalOverlay.add(this.add.text(0, 230, 'ENTENDI', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0.5));
  }
}
