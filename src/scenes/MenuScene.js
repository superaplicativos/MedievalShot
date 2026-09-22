// ============================================================
// Medieval Kingshot - MenuScene
// ============================================================
// Menu principal (single-player puro, sem multiplayer):
//   - Título
//   - Card de progresso do jogador
//   - Botão "Jogar" (vai para a última fase desbloqueada)
//   - Botão "Selecionar Fase"
//   - Botão "🏆 Ranking Global"
//   - Botão "Editar Nickname"
//   - Botão "Como Jogar"
// ============================================================

import Phaser from 'phaser';
import {
  loginAnonimo,
  carregarProgresso,
  firebaseConfigurado,
  setNickname,
} from '../firebase.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  async create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    // --------------------------------------------------------
    // Fundo
    // --------------------------------------------------------
    this.cameras.main.setBackgroundColor('#1a1410');

    // Brasas flutuantes
    for (let i = 0; i < 30; i++) {
      const estrela = this.add.circle(
        Phaser.Math.Between(0, largura),
        Phaser.Math.Between(0, altura),
        Phaser.Math.Between(1, 3),
        0xd4a544,
        Phaser.Math.FloatBetween(0.2, 0.6)
      );
      this.tweens.add({
        targets: estrela,
        alpha: 0,
        duration: Phaser.Math.Between(1500, 3500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }

    // Título
    this.add
      .text(largura / 2, 70, '⚔️ MEDIEVAL KINGSHOT ⚔️', {
        fontFamily: 'Georgia, serif',
        fontSize: '40px',
        color: '#d4a544',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(largura / 2, 115, 'Tower Defense Medieval', {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        color: '#9a8a6a',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // Status Firebase
    const statusColor = firebaseConfigurado ? '#2ecc71' : '#e74c3c';
    const statusText = firebaseConfigurado ? '🟢 Online' : '🔴 Offline';
    this.add
      .text(largura - 90, 25, statusText, {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: statusColor,
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    // --------------------------------------------------------
    // Login + carregar progresso
    // --------------------------------------------------------
    this.mostrarCarregando('Conectando...');

    try {
      await loginAnonimo();
      this.progresso = await carregarProgresso();
      if (!this.progresso) {
        this.progresso = { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
      }
    } catch (e) {
      console.warn('[MenuScene] Erro ao carregar:', e);
      this.progresso = { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
    }

    this.esconderCarregando();
    this.renderizarCardProgresso();

    // --------------------------------------------------------
    // Botões
    // --------------------------------------------------------
    const faseInicial = this.proximaFaseJogavel();
    this.criarBotao(largura / 2, 290, `▶ JOGAR (Fase ${faseInicial})`, '#2ecc71', () => {
      this.iniciarFase(faseInicial);
    });

    this.criarBotao(largura / 2, 355, '📋 SELECIONAR FASE', '#3498db', () => {
      this.mostrarSelecaoFase();
    });

    this.criarBotao(largura / 2, 420, '🏆 RANKING GLOBAL', '#9b59b6', () => {
      this.scene.start('RankingScene');
    });

    this.criarBotao(largura / 2, 485, '✏ EDITAR NICKNAME', '#f39c12', () => {
      this.editarNickname();
    });

    this.criarBotao(largura / 2, 550, 'ℹ COMO JOGAR', '#7f8c8d', () => {
      this.mostrarAjuda();
    });

    // Rodapé
    this.add
      .text(largura / 2, altura - 15, 'Phaser 3 + Firebase | Single-Player Tower Defense', {
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        color: '#5a4a3a',
      })
      .setOrigin(0.5);
  }

  proximaFaseJogavel() {
    // Jogador pode jogar a fase mais alta desbloqueada (ou a anterior)
    const maxLevel = this.progresso?.level || 1;
    if (maxLevel >= 2) return 2;
    return 1;
  }

  iniciarFase(numeroFase) {
    if (numeroFase === 1) this.scene.start('Level01Scene');
    else if (numeroFase === 2) this.scene.start('Level02Scene');
  }

  renderizarCardProgresso() {
    const largura = this.scale.width;
    if (this.cardProgresso) this.cardProgresso.destroy();
    this.cardProgresso = this.add.container(largura / 2, 195);

    const fundo = this.add.rectangle(0, 0, 460, 60, 0x2a2018, 0.9);
    fundo.setStrokeStyle(2, 0xd4a544, 0.6);
    this.cardProgresso.add(fundo);

    const nick = this.progresso.nickname || 'Guerreiro Anônimo';
    const texto = this.add
      .text(
        0,
        -10,
        `${nick}`,
        {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: '#d4a544',
        }
      )
      .setOrigin(0.5);
    this.cardProgresso.add(texto);

    const stats = this.add
      .text(
        0,
        12,
        `Nível: ${this.progresso.level || 1}  |  💰 ${this.progresso.coins || 0}  |  🏆 ${this.progresso.score || 0} pts  |  ☠ ${this.progresso.kills || 0} kills`,
        {
          fontFamily: 'Courier New, monospace',
          fontSize: '13px',
          color: '#f5e6c8',
        }
      )
      .setOrigin(0.5);
    this.cardProgresso.add(stats);
  }

  criarBotao(x, y, texto, corHex, callback) {
    const cor = Phaser.Display.Color.HexStringToColor(corHex).color;
    const botao = this.add.container(x, y);
    const fundo = this.add.rectangle(0, 0, 360, 50, cor, 0.85);
    fundo.setStrokeStyle(3, 0x000000, 0.6);
    botao.add(fundo);
    const label = this.add
      .text(0, 0, texto, {
        fontFamily: 'Georgia, serif',
        fontSize: '18px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    botao.add(label);

    fundo.setInteractive({ useHandCursor: true });
    fundo.on('pointerover', () => {
      fundo.setFillStyle(cor, 1);
      fundo.setScale(1.04);
      label.setScale(1.04);
    });
    fundo.on('pointerout', () => {
      fundo.setFillStyle(cor, 0.85);
      fundo.setScale(1);
      label.setScale(1);
    });
    fundo.on('pointerdown', () => {
      fundo.setFillStyle(0xffffff, 0.9);
      this.cameras.main.fadeOut(150, 0, 0, 0);
      this.time.delayedCall(150, callback);
    });

    return botao;
  }

  mostrarCarregando(msg = 'Carregando...') {
    this.esconderCarregando();
    this.loadingOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const fundo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7);
    const texto = this.add
      .text(0, 0, msg, { fontFamily: 'Georgia, serif', fontSize: '24px', color: '#d4a544' })
      .setOrigin(0.5);
    this.loadingOverlay.add([fundo, texto]);
  }

  esconderCarregando() {
    if (this.loadingOverlay) {
      this.loadingOverlay.destroy();
      this.loadingOverlay = null;
    }
  }

  // --------------------------------------------------------
  // SELEÇÃO DE FASE
  // --------------------------------------------------------
  mostrarSelecaoFase() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.modalOverlay = this.add.container(largura / 2, altura / 2);
    const fundo = this.add.rectangle(0, 0, largura, altura, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);

    const painel = this.add.rectangle(0, 0, 500, 400, 0x2a2018, 0.95);
    painel.setStrokeStyle(3, 0xd4a544, 0.8);
    this.modalOverlay.add(painel);

    this.modalOverlay.add(
      this.add
        .text(0, -160, '📋 SELECIONAR FASE', {
          fontFamily: 'Georgia, serif',
          fontSize: '24px',
          color: '#d4a544',
          stroke: '#000000',
          strokeThickness: 3,
        })
        .setOrigin(0.5)
    );

    const maxLevel = this.progresso.level || 1;

    // Fase 1
    const fase1Desbloqueada = true;
    this.criarCardFase(0, -70, 1, 'Goblins', '#2ecc71', fase1Desbloqueada, maxLevel >= 2);

    // Fase 2
    const fase2Desbloqueada = maxLevel >= 2;
    this.criarCardFase(0, 30, 2, 'Ogros', '#e74c3c', fase2Desbloqueada, maxLevel >= 3);

    // Botão fechar
    const btnFechar = this.add.rectangle(0, 150, 200, 40, 0xe74c3c, 0.9);
    btnFechar.setStrokeStyle(2, 0x000000, 0.6);
    btnFechar.setInteractive({ useHandCursor: true });
    btnFechar.on('pointerover', () => btnFechar.setFillStyle(0xe74c3c, 1));
    btnFechar.on('pointerout', () => btnFechar.setFillStyle(0xe74c3c, 0.9));
    btnFechar.on('pointerdown', () => this.modalOverlay.destroy());
    this.modalOverlay.add(btnFechar);
    this.modalOverlay.add(
      this.add
        .text(0, 150, 'FECHAR', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#ffffff' })
        .setOrigin(0.5)
    );
  }

  criarCardFase(x, y, numero, nome, corHex, desbloqueada, concluida) {
    const cor = Phaser.Display.Color.HexStringToColor(corHex).color;
    const card = this.add.container(x, y);
    this.modalOverlay.add(card);

    const fundo = this.add.rectangle(0, 0, 380, 60, desbloqueada ? cor : 0x4a4a4a, 0.8);
    fundo.setStrokeStyle(2, desbloqueada ? 0xd4a544 : 0x2a2a2a, 0.8);
    card.add(fundo);

    const icone = concluida ? '✅' : desbloqueada ? '▶' : '🔒';
    card.add(
      this.add
        .text(-160, 0, `Fase ${numero}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0, 0.5)
    );

    card.add(
      this.add
        .text(20, 0, `${nome}`, {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          color: '#f5e6c8',
        })
        .setOrigin(0.5)
    );

    card.add(
      this.add
        .text(160, 0, icone, { fontFamily: 'Arial', fontSize: '20px' })
        .setOrigin(0.5)
    );

    if (desbloqueada) {
      fundo.setInteractive({ useHandCursor: true });
      fundo.on('pointerover', () => fundo.setFillStyle(cor, 1));
      fundo.on('pointerout', () => fundo.setFillStyle(cor, 0.8));
      fundo.on('pointerdown', () => {
        this.modalOverlay.destroy();
        this.iniciarFase(numero);
      });
    }
  }

  // --------------------------------------------------------
  // EDITAR NICKNAME
  // --------------------------------------------------------
  editarNickname() {
    const atual = this.progresso.nickname || '';
    const novo = prompt('Digite seu nickname (máx 16 caracteres):', atual);
    if (novo && novo.trim()) {
      setNickname(novo.trim()).then(() => {
        this.progresso.nickname = novo.trim().substring(0, 16);
        this.renderizarCardProgresso();
      });
    }
  }

  // --------------------------------------------------------
  // AJUDA
  // --------------------------------------------------------
  mostrarAjuda() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.modalOverlay = this.add.container(largura / 2, altura / 2);
    const fundo = this.add.rectangle(0, 0, largura, altura, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);

    const painel = this.add.rectangle(0, 0, 540, 480, 0x2a2018, 0.95);
    painel.setStrokeStyle(3, 0xd4a544, 0.8);
    this.modalOverlay.add(painel);

    const linhas = [
      '📖 COMO JOGAR',
      '',
      '• Sua torre está no centro da arena.',
      '• Inimigos surgem das bordas e avançam.',
      '• A torre atira automaticamente flechas',
      '   no inimigo mais próximo.',
      '• Se um inimigo tocar sua torre, ela perde HP.',
      '',
      '🎯 OBJETIVOS:',
      '• Sobreviva o tempo necessário,',
      '   ou mate X inimigos para vencer a fase.',
      '',
      '🏆 RANKING:',
      '• Cada kill e cada vitória somam pontos.',
      '• Seu score é somado ao total global.',
      '• Veja sua posição no Ranking Global!',
      '',
      '💰 MOEDAS:',
      '• Cada inimigo morto dá moedas.',
      '• (Em breve: upgrades de torre!)',
    ];

    this.modalOverlay.add(
      this.add
        .text(0, 0, linhas.join('\n'), {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: '#f5e6c8',
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5)
    );

    const btnFechar = this.add.rectangle(0, 210, 200, 40, 0xe74c3c, 0.9);
    btnFechar.setStrokeStyle(2, 0x000000, 0.6);
    btnFechar.setInteractive({ useHandCursor: true });
    btnFechar.on('pointerdown', () => this.modalOverlay.destroy());
    this.modalOverlay.add(btnFechar);
    this.modalOverlay.add(
      this.add
        .text(0, 210, 'ENTENDI', { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#ffffff' })
        .setOrigin(0.5)
    );
  }
}
