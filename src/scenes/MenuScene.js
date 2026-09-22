// ============================================================
// Medieval Kingshot - MenuScene (Visual Medieval Polido)
// ============================================================
// Menu principal com:
//   - Fundo: cenário com céu gradiente, montanhas, castelo
//   - Título: estilo entalhado em pedra
//   - Botões: madeira com bordas douradas e rivets
//   - Ícones: sprites desenhados (sem emojis)
//   - Decorações: bandeiras, brasões
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

    // ============================================================
    // FUNDO: cenário medieval
    // ============================================================
    this.criarCenarioFundo();

    // ============================================================
    // TÍTULO COM EFEITO DE PEDRA
    // ============================================================
    this.criarTitulo();

    // Status Firebase (canto superior direito)
    this.criarStatusBadge();

    // ============================================================
    // LOGIN + PROGRESSO
    // ============================================================
    this.mostrarCarregando('Conectando ao reino...');

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

    // Card de progresso (pergaminho)
    this.renderizarCardProgresso();

    // ============================================================
    // BOTÕES MEDIEVAIS
    // ============================================================
    const faseInicial = this.proximaFaseJogavel();

    this.criarBotaoMedieval(largura / 2, 290, 'icon_espada', `JOGAR (FASE ${faseInicial})`, 0x2ecc71, () => {
      this.iniciarFase(faseInicial);
    });

    this.criarBotaoMedieval(largura / 2, 350, 'icon_escudo', 'SELECIONAR FASE', 0x3498db, () => {
      this.mostrarSelecaoFase();
    });

    this.criarBotaoMedieval(largura / 2, 410, 'icon_trofeu', 'RANKING GLOBAL', 0x9b59b6, () => {
      this.scene.start('RankingScene');
    });

    this.criarBotaoMedieval(largura / 2, 470, 'icon_coroa', 'EDITAR NICKNAME', 0xf39c12, () => {
      this.editarNickname();
    });

    this.criarBotaoMedieval(largura / 2, 530, 'icon_pergaminho', 'COMO JOGAR', 0x7f8c8d, () => {
      this.mostrarAjuda();
    });

    // Rodapé
    this.add
      .text(largura / 2, altura - 12, '⚔ Medieval Kingshot ⚔  Single-Player Tower Defense', {
        fontFamily: 'Cinzel, serif',
        fontSize: '11px',
        color: '#8a7050',
      })
      .setOrigin(0.5);
  }

  // ============================================================
  // CENÁRIO DE FUNDO
  // ============================================================
  criarCenarioFundo() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    // Gradiente vertical: céu noturno -> pôr do sol
    const fundo = this.add.graphics();
    for (let y = 0; y < altura; y++) {
      const t = y / altura;
      let r, g, b;
      if (t < 0.5) {
        // Céu noturno -> crepúsculo
        const tt = t * 2;
        r = Math.floor(20 + (90 - 20) * tt);
        g = Math.floor(15 + (40 - 15) * tt);
        b = Math.floor(35 + (70 - 35) * tt);
      } else {
        // Chão escuro
        const tt = (t - 0.5) * 2;
        r = Math.floor(30 + (15 - 30) * tt);
        g = Math.floor(25 + (10 - 25) * tt);
        b = Math.floor(20 + (8 - 20) * tt);
      }
      fundo.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      fundo.fillRect(0, y, largura, 1);
    }

    // Estrelas
    for (let i = 0; i < 50; i++) {
      const estrela = this.add.circle(
        Phaser.Math.Between(0, largura),
        Phaser.Math.Between(0, altura / 2),
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
    const lua = this.add.circle(680, 80, 28, 0xf5e6c8, 0.9);
    lua.setStrokeStyle(2, 0xd4a544, 0.4);
    // Halo da lua
    const halo = this.add.circle(680, 80, 45, 0xfff0a0, 0.1);

    // Montanhas distantes (silhuetas)
    const montanhas = this.add.graphics();
    montanhas.fillStyle(0x1a0f15, 0.7);
    montanhas.beginPath();
    montanhas.moveTo(0, altura - 80);
    for (let x = 0; x <= largura; x += 40) {
      const y = altura - 80 - Math.sin(x * 0.01) * 30 - Math.random() * 10;
      montanhas.lineTo(x, y);
    }
    montanhas.lineTo(largura, altura);
    montanhas.lineTo(0, altura);
    montanhas.closePath();
    montanhas.fillPath();

    // Montanhas mais próximas
    montanhas.fillStyle(0x0d0805, 0.9);
    montanhas.beginPath();
    montanhas.moveTo(0, altura - 40);
    for (let x = 0; x <= largura; x += 30) {
      const y = altura - 40 - Math.sin(x * 0.02 + 1) * 25 - Math.random() * 8;
      montanhas.lineTo(x, y);
    }
    montanhas.lineTo(largura, altura);
    montanhas.lineTo(0, altura);
    montanhas.closePath();
    montanhas.fillPath();

    // Castelo ao fundo (centro)
    this.add.image(largura / 2, altura - 60, 'decor_castelo').setScale(1.5).setAlpha(0.4);

    // Bandeiras decorativas (laterais)
    this.add.image(100, 100, 'decor_bandeira').setScale(0.8).setAlpha(0.8);
    this.add.image(700, 100, 'decor_bandeira').setScale(0.8).setFlipX(true).setAlpha(0.8);

    // Brasão decorativo (canto inferior esquerdo)
    this.add.image(60, altura - 60, 'decor_brasao').setScale(0.5).setAlpha(0.6);
    this.add.image(largura - 60, altura - 60, 'decor_brasao').setScale(0.5).setAlpha(0.6);
  }

  // ============================================================
  // TÍTULO COM EFEITO DE PEDRA
  // ============================================================
  criarTitulo() {
    const largura = this.scale.width;

    // Sombra do título
    this.add
      .text(largura / 2 + 4, 64, 'MEDIEVAL KINGSHOT', {
        fontFamily: 'Cinzel, serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.6);

    // Título principal (com gradiente dourado simulado)
    const titulo = this.add
      .text(largura / 2, 60, 'MEDIEVAL KINGSHOT', {
        fontFamily: 'Cinzel, serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#d4a544',
        stroke: '#3a2410',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Highlight
    const highlight = this.add
      .text(largura / 2, 58, 'MEDIEVAL KINGSHOT', {
        fontFamily: 'Cinzel, serif',
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#fff0a0',
      })
      .setOrigin(0.5)
      .setAlpha(0.3);

    // Brilho pulsante
    this.tweens.add({
      targets: [titulo, highlight],
      alpha: { from: 1, to: 0.85 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    // Subtítulo
    this.add
      .text(largura / 2, 100, '⚔ Tower Defense Medieval ⚔', {
        fontFamily: 'MedievalSharp, serif',
        fontSize: '16px',
        color: '#9a8a6a',
      })
      .setOrigin(0.5);

    // Linha decorativa
    const linhaDeco = this.add.graphics();
    linhaDeco.fillStyle(0xd4a544, 0.6);
    linhaDeco.fillRect(largura / 2 - 150, 118, 300, 1);
    // Ornamentos centrais
    linhaDeco.fillStyle(0xd4a544, 1);
    linhaDeco.fillCircle(largura / 2, 118, 3);
    linhaDeco.fillCircle(largura / 2 - 160, 118, 2);
    linhaDeco.fillCircle(largura / 2 + 160, 118, 2);
  }

  // ============================================================
  // BADGE DE STATUS
  // ============================================================
  criarStatusBadge() {
    const largura = this.scale.width;
    const online = firebaseConfigurado;

    const badge = this.add.container(largura - 100, 30);
    const fundo = this.add.rectangle(0, 0, 120, 26, 0x000000, 0.7);
    fundo.setStrokeStyle(1, online ? 0x2ecc71 : 0xe74c3c, 0.8);
    badge.add(fundo);

    // Indicador (piscando)
    const dot = this.add.circle(-45, 0, 5, online ? 0x2ecc71 : 0xe74c3c);
    badge.add(dot);
    this.tweens.add({
      targets: dot,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    badge.add(
      this.add
        .text(-30, 0, online ? 'Online' : 'Offline', {
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          color: online ? '#2ecc71' : '#e74c3c',
        })
        .setOrigin(0, 0.5)
    );
  }

  proximaFaseJogavel() {
    const maxLevel = this.progresso?.level || 1;
    if (maxLevel >= 2) return 2;
    return 1;
  }

  iniciarFase(numeroFase) {
    if (numeroFase === 1) this.scene.start('Level01Scene');
    else if (numeroFase === 2) this.scene.start('Level02Scene');
  }

  // ============================================================
  // CARD DE PROGRESSO (painel de pergaminho)
  // ============================================================
  renderizarCardProgresso() {
    const largura = this.scale.width;
    if (this.cardProgresso) this.cardProgresso.destroy();
    this.cardProgresso = this.add.container(largura / 2, 165);

    // Painel de madeira
    const painel = this.add.image(0, 0, 'painel_madeira').setDisplaySize(480, 60);
    this.cardProgresso.add(painel);

    // Ícone de coroa (à esquerda)
    const coroa = this.add.image(-210, 0, 'icon_coroa').setScale(0.9);
    this.cardProgresso.add(coroa);

    // Nickname
    const nick = this.progresso.nickname || 'Guerreiro Anônimo';
    const textoNick = this.add
      .text(-180, -12, nick, {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#d4a544',
      })
      .setOrigin(0, 0.5);
    this.cardProgresso.add(textoNick);

    // Estatísticas com ícones
    const stats = this.add.container(0, 12);
    let xOffset = -180;

    // Nível
    stats.add(this.add.image(xOffset, 0, 'icon_escudo').setScale(0.5));
    stats.add(this.add.text(xOffset + 12, 0, `${this.progresso.level || 1}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    xOffset += 50;

    // Moedas
    stats.add(this.add.image(xOffset, 0, 'icon_moeda').setScale(0.5));
    stats.add(this.add.text(xOffset + 12, 0, `${this.progresso.coins || 0}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    xOffset += 60;

    // Score
    stats.add(this.add.image(xOffset, 0, 'icon_estrela').setScale(0.5));
    stats.add(this.add.text(xOffset + 12, 0, `${this.progresso.score || 0} pts`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
    xOffset += 80;

    // Kills
    stats.add(this.add.image(xOffset, 0, 'icon_caveira').setScale(0.5));
    stats.add(this.add.text(xOffset + 12, 0, `${this.progresso.kills || 0}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));

    this.cardProgresso.add(stats);
  }

  // ============================================================
  // BOTÃO MEDIEVAL (madeira com ícone + texto)
  // ============================================================
  criarBotaoMedieval(x, y, iconeTexture, texto, corDestaque, callback) {
    const botao = this.add.container(x, y);

    // Textura de madeira
    const fundo = this.add.image(0, 0, 'btn_madeira');
    botao.add(fundo);

    // Overlay de cor (quando hover)
    const overlay = this.add.rectangle(0, 0, 360, 48, corDestaque, 0);
    botao.add(overlay);

    // Ícone (à esquerda)
    const icone = this.add.image(-150, 0, iconeTexture).setScale(1.1);
    botao.add(icone);

    // Texto
    const label = this.add
      .text(0, 0, texto, {
        fontFamily: 'Cinzel, serif',
        fontSize: '17px',
        fontStyle: 'bold',
        color: '#f5e6c8',
        stroke: '#000000',
        strokeThickness: 2,
      })
      .setOrigin(0.5);
    botao.add(label);

    // Interatividade
    fundo.setInteractive({ useHandCursor: true });
    fundo.on('pointerover', () => {
      this.tweens.add({
        targets: botao,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 100,
        ease: 'Quad.out',
      });
      overlay.setFillStyle(corDestaque, 0.3);
      icone.setTint(0xfff0a0);
    });
    fundo.on('pointerout', () => {
      this.tweens.add({
        targets: botao,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Quad.out',
      });
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

  // ============================================================
  // CARREGANDO
  // ============================================================
  mostrarCarregando(msg = 'Carregando...') {
    this.esconderCarregando();
    this.loadingOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const fundo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.85);
    const texto = this.add
      .text(0, 0, msg, {
        fontFamily: 'Cinzel, serif',
        fontSize: '24px',
        color: '#d4a544',
      })
      .setOrigin(0.5);
    this.loadingOverlay.add([fundo, texto]);
  }

  esconderCarregando() {
    if (this.loadingOverlay) {
      this.loadingOverlay.destroy();
      this.loadingOverlay = null;
    }
  }

  // ============================================================
  // SELEÇÃO DE FASE
  // ============================================================
  mostrarSelecaoFase() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.modalOverlay = this.add.container(largura / 2, altura / 2);

    // Fundo escurecido
    const fundo = this.add.rectangle(0, 0, largura, altura, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);

    // Painel de pergaminho
    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(540, 440);
    this.modalOverlay.add(painel);

    // Título
    this.modalOverlay.add(
      this.add
        .text(0, -170, 'SELECIONAR FASE', {
          fontFamily: 'Cinzel, serif',
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#5a3a20',
        })
        .setOrigin(0.5)
    );

    // Linha decorativa
    const linha = this.add.graphics();
    linha.fillStyle(0x8a6a40, 0.6);
    linha.fillRect(-150, -145, 300, 2);
    this.modalOverlay.add(linha);

    const maxLevel = this.progresso.level || 1;

    // Fase 1
    const fase1Desbloqueada = true;
    this.criarCardFasePergaminho(0, -60, 1, 'Goblins', 0x2ecc71, fase1Desbloqueada, maxLevel >= 2);

    // Fase 2
    const fase2Desbloqueada = maxLevel >= 2;
    this.criarCardFasePergaminho(0, 40, 2, 'Ogros + Boss', 0xe74c3c, fase2Desbloqueada, maxLevel >= 3);

    // Botão fechar
    this.criarBotaoFecharModal(0, 160, 'FECHAR');
  }

  criarCardFasePergaminho(x, y, numero, nome, corDestaque, desbloqueada, concluida) {
    const card = this.add.container(x, y);
    this.modalOverlay.add(card);

    // Fundo do card (madeira)
    const fundo = this.add.image(0, 0, 'btn_madeira').setDisplaySize(420, 56);
    if (!desbloqueada) {
      fundo.setTint(0x666666);
    }
    card.add(fundo);

    // Overlay de cor
    const overlay = this.add.rectangle(0, 0, 410, 44, corDestaque, 0.15);
    card.add(overlay);

    // Ícone
    const iconeTexture = concluida ? 'icon_trofeu' : desbloqueada ? 'icon_escudo' : 'icon_pergaminho';
    const icone = this.add.image(-170, 0, iconeTexture).setScale(0.8);
    if (!desbloqueada) icone.setTint(0x888888);
    card.add(icone);

    // Texto
    card.add(
      this.add
        .text(-130, -8, `FASE ${numero}`, {
          fontFamily: 'Cinzel, serif',
          fontSize: '16px',
          fontStyle: 'bold',
          color: desbloqueada ? '#fff0a0' : '#888888',
        })
        .setOrigin(0, 0.5)
    );

    card.add(
      this.add
        .text(-130, 10, nome, {
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          color: desbloqueada ? '#f5e6c8' : '#666666',
        })
        .setOrigin(0, 0.5)
    );

    // Status
    const status = concluida ? 'CONCLUÍDA' : desbloqueada ? 'DISPONÍVEL' : 'BLOQUEADA';
    const cor = concluida ? '#2ecc71' : desbloqueada ? '#d4a544' : '#666666';
    card.add(
      this.add
        .text(170, 0, status, {
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          fontStyle: 'bold',
          color: cor,
        })
        .setOrigin(1, 0.5)
    );

    if (desbloqueada) {
      fundo.setInteractive({ useHandCursor: true });
      fundo.on('pointerover', () => {
        this.tweens.add({
          targets: card,
          scaleX: 1.04,
          scaleY: 1.04,
          duration: 100,
        });
        overlay.setFillStyle(corDestaque, 0.4);
      });
      fundo.on('pointerout', () => {
        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
        overlay.setFillStyle(corDestaque, 0.15);
      });
      fundo.on('pointerdown', () => {
        this.cameras.main.fadeOut(150, 0, 0, 0);
        this.time.delayedCall(150, () => this.iniciarFase(numero));
      });
    }
  }

  criarBotaoFecharModal(x, y, texto) {
    const botao = this.add.container(x, y);
    const fundo = this.add.image(0, 0, 'btn_madeira_peq').setDisplaySize(180, 40);
    botao.add(fundo);
    const label = this.add
      .text(0, 0, texto, {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#f5e6c8',
      })
      .setOrigin(0.5);
    botao.add(label);
    fundo.setInteractive({ useHandCursor: true });
    fundo.on('pointerover', () => fundo.setTint(0xcc6666));
    fundo.on('pointerout', () => fundo.clearTint());
    fundo.on('pointerdown', () => this.modalOverlay.destroy());
    this.modalOverlay.add(botao);
  }

  // ============================================================
  // EDITAR NICKNAME
  // ============================================================
  editarNickname() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.modalOverlay = this.add.container(largura / 2, altura / 2);
    const fundo = this.add.rectangle(0, 0, largura, altura, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);

    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(440, 280);
    this.modalOverlay.add(painel);

    this.modalOverlay.add(
      this.add
        .text(0, -90, 'EDITAR NICKNAME', {
          fontFamily: 'Cinzel, serif',
          fontSize: '22px',
          fontStyle: 'bold',
          color: '#5a3a20',
        })
        .setOrigin(0.5)
    );

    this.modalOverlay.add(
      this.add
        .text(0, -50, 'Como você quer ser chamado no ranking?', {
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          color: '#8a6a40',
        })
        .setOrigin(0.5)
    );

    // Caixa de input simulada
    const atual = this.progresso.nickname || '';
    const novo = prompt('Digite seu nickname (máx 16 caracteres):', atual);

    if (novo && novo.trim()) {
      setNickname(novo.trim()).then(() => {
        this.progresso.nickname = novo.trim().substring(0, 16);
        this.renderizarCardProgresso();
      });
    }

    this.modalOverlay.destroy();
  }

  // ============================================================
  // AJUDA
  // ============================================================
  mostrarAjuda() {
    if (this.modalOverlay) this.modalOverlay.destroy();
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.modalOverlay = this.add.container(largura / 2, altura / 2);
    const fundo = this.add.rectangle(0, 0, largura, altura, 0x000000, 0.85);
    fundo.setInteractive();
    this.modalOverlay.add(fundo);

    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(540, 480);
    this.modalOverlay.add(painel);

    this.modalOverlay.add(
      this.add
        .text(0, -200, 'COMO JOGAR', {
          fontFamily: 'Cinzel, serif',
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#5a3a20',
        })
        .setOrigin(0.5)
    );

    const linhas = [
      'Sua torre está no centro da arena.',
      'Inimigos surgem das bordas e avançam.',
      'A torre atira flechas automaticamente',
      'no inimigo mais próximo.',
      '',
      'OBJETIVOS',
      'Sobreviva o tempo necessário,',
      'ou mate X inimigos para vencer.',
      '',
      'RANKING',
      'Cada kill e cada vitória somam pontos.',
      'Seu score é acumulado no ranking global.',
      '',
      'MOEDAS',
      'Cada inimigo morto dá moedas.',
      '(Em breve: upgrades de torre!)',
    ];

    this.modalOverlay.add(
      this.add
        .text(0, 0, linhas.join('\n'), {
          fontFamily: 'MedievalSharp, serif',
          fontSize: '14px',
          color: '#5a3a20',
          align: 'center',
          lineSpacing: 4,
        })
        .setOrigin(0.5)
    );

    this.criarBotaoFecharModal(0, 200, 'ENTENDI');
  }
}
