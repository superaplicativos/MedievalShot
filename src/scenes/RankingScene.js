// ============================================================
// Medieval Kingshot - RankingScene (Tema Pergaminho)
// ============================================================
// Tela de ranking global com visual medieval polido:
//   - Fundo: mesmo cenário do menu
//   - Painel de pergaminho antigo como fundo da lista
//   - Top 10 com medalhas desenhadas
//   - Sua posição destacada em vermelho realçado
// ============================================================

import Phaser from 'phaser';
import {
  loginAnonimo,
  carregarProgresso,
  getTop10,
  getRankingContexto,
  getEstatisticasGlobais,
} from '../firebase.js';

export default class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RankingScene' });
  }

  async create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    // Fundo igual ao menu (cenário medieval)
    this.criarCenarioFundo();

    // Título
    this.add
      .text(largura / 2 + 3, 50, 'RANKING GLOBAL', {
        fontFamily: 'Cinzel, serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setAlpha(0.6);

    this.add
      .text(largura / 2, 47, 'RANKING GLOBAL', {
        fontFamily: 'Cinzel, serif',
        fontSize: '38px',
        fontStyle: 'bold',
        color: '#d4a544',
        stroke: '#3a2410',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(largura / 2, 82, 'Os melhores guerreiros do reino', {
        fontFamily: 'MedievalSharp, serif',
        fontSize: '14px',
        color: '#9a8a6a',
      })
      .setOrigin(0.5);

    // Linha decorativa
    const linha = this.add.graphics();
    linha.fillStyle(0xd4a544, 0.6);
    linha.fillRect(largura / 2 - 150, 100, 300, 1);
    linha.fillStyle(0xd4a544, 1);
    linha.fillCircle(largura / 2, 100, 3);

    // ============================================================
    // CARREGAR DADOS
    // ============================================================
    this.mostrarCarregando('Consultando os bardos...');

    try {
      await loginAnonimo();
      const [top10, contexto, stats] = await Promise.all([
        getTop10(),
        getRankingContexto(),
        getEstatisticasGlobais(),
      ]);

      this.esconderCarregando();

      // Painel de estatísticas
      this.renderizarEstatisticas(stats);

      // Top 10
      this.renderizarTop10(top10);

      // Minha posição
      this.renderizarMeuRanking(contexto);
    } catch (e) {
      console.error('[RankingScene] Erro:', e);
      this.esconderCarregando();
      this.add
        .text(largura / 2, altura / 2, 'Erro ao carregar ranking.', {
          fontFamily: 'Cinzel, serif',
          fontSize: '16px',
          color: '#e74c3c',
        })
        .setOrigin(0.5);
    }

    // Botão voltar
    this.criarBotaoMedieval(largura / 2, altura - 35, 'icon_pergaminho', 'VOLTAR AO MENU', 0x7f8c8d, () => {
      this.scene.start('MenuScene');
    });
  }

  // ============================================================
  // CENÁRIO DE FUNDO (igual ao menu)
  // ============================================================
  criarCenarioFundo() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    const fundo = this.add.graphics();
    for (let y = 0; y < altura; y++) {
      const t = y / altura;
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
      fundo.fillRect(0, y, largura, 1);
    }

    // Estrelas
    for (let i = 0; i < 40; i++) {
      this.add.circle(
        Phaser.Math.Between(0, largura),
        Phaser.Math.Between(0, altura / 2),
        Phaser.Math.Between(0.5, 2),
        0xfff0a0,
        Phaser.Math.FloatBetween(0.3, 0.8)
      );
    }

    // Lua
    this.add.circle(largura - 80, 70, 24, 0xf5e6c8, 0.7).setStrokeStyle(2, 0xd4a544, 0.3);
  }

  // ============================================================
  // ESTATÍSTICAS GLOBAIS
  // ============================================================
  renderizarEstatisticas(stats) {
    const largura = this.scale.width;
    const card = this.add.container(largura / 2, 130);

    const painel = this.add.image(0, 0, 'painel_madeira').setDisplaySize(480, 36);
    card.add(painel);

    // Ícones
    card.add(this.add.image(-180, 0, 'icon_coroa').setScale(0.6));
    card.add(this.add.text(-160, 0, `${stats.totalJogadores} guerreiros`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));

    card.add(this.add.image(20, 0, 'icon_estrela').setScale(0.6));
    card.add(this.add.text(40, 0, `Maior score: ${(stats.maiorScore || 0).toLocaleString('pt-BR')}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5));
  }

  // ============================================================
  // TOP 10
  // ============================================================
  renderizarTop10(top10) {
    const largura = this.scale.width;

    // Painel de pergaminho grande
    const card = this.add.container(largura / 2, 290);
    const painel = this.add.image(0, 0, 'painel_pergaminho').setDisplaySize(520, 260);
    card.add(painel);

    // Título
    card.add(
      this.add
        .text(0, -110, 'TOP 10 GUERREIROS', {
          fontFamily: 'Cinzel, serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: '#5a3a20',
        })
        .setOrigin(0.5)
    );

    // Troféu central no topo
    card.add(this.add.image(0, -90, 'icon_trofeu').setScale(0.8));

    if (top10.length === 0) {
      card.add(
        this.add
          .text(0, 0, 'Nenhum guerreiro no ranking ainda.\nSeja o primeiro a marcar pontos!', {
            fontFamily: 'MedievalSharp, serif',
            fontSize: '14px',
            color: '#8a6a40',
            align: 'center',
          })
          .setOrigin(0.5)
      );
      return;
    }

    // Cabeçalho da tabela
    const headerY = -55;
    card.add(this.add.text(-220, headerY, '#', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#8a6a40',
    }).setOrigin(0, 0.5));
    card.add(this.add.text(-180, headerY, 'GUERREIRO', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#8a6a40',
    }).setOrigin(0, 0.5));
    card.add(this.add.text(120, headerY, 'PONTOS', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#8a6a40',
    }).setOrigin(0, 0.5));
    card.add(this.add.text(200, headerY, 'FASE', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#8a6a40',
    }).setOrigin(0, 0.5));

    // Linha separadora
    const sep = this.add.graphics();
    sep.fillStyle(0x8a6a40, 0.4);
    sep.fillRect(-220, headerY + 10, 440, 1);
    card.add(sep);

    // Lista
    top10.forEach((jogador, i) => {
      const y = -35 + i * 18;
      const isTop3 = i < 3;

      // Destaque para top 3 (fundo colorido)
      if (isTop3) {
        const corFundo = i === 0 ? 0xd4a544 : i === 1 ? 0xc0c0c0 : 0xcd7f32;
        const hl = this.add.rectangle(0, y, 480, 16, corFundo, 0.2);
        card.add(hl);
      }

      // Posição com medalha
      let posText;
      if (i === 0) posText = '1°';
      else if (i === 1) posText = '2°';
      else if (i === 2) posText = '3°';
      else posText = `${i + 1}°`;

      const cor = i === 0 ? '#d4a544' : i === 1 ? '#888888' : i === 2 ? '#cd7f32' : '#5a3a20';

      card.add(this.add.text(-220, y, posText, {
        fontFamily: 'Cinzel, serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: cor,
      }).setOrigin(0, 0.5));

      // Ícone para top 3
      if (isTop3) {
        card.add(this.add.image(-200, y, 'icon_trofeu').setScale(0.4));
      }

      // Nickname (com limite de 16 chars)
      const nick = (jogador.nickname || 'Anônimo').substring(0, 16);
      card.add(this.add.text(-180, y, nick, {
        fontFamily: 'Cinzel, serif',
        fontSize: '12px',
        color: '#5a3a20',
      }).setOrigin(0, 0.5));

      // Score
      card.add(this.add.text(120, y, `${(jogador.score || 0).toLocaleString('pt-BR')}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#5a3a20',
      }).setOrigin(0, 0.5));

      // Level
      card.add(this.add.text(200, y, `${jogador.level || 1}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '12px',
        color: '#8a6a40',
      }).setOrigin(0, 0.5));
    });
  }

  // ============================================================
  // MINHA POSIÇÃO
  // ============================================================
  renderizarMeuRanking(contexto) {
    const largura = this.scale.width;
    const card = this.add.container(largura / 2, 470);

    // Painel destacado (verde/dourado)
    const painel = this.add.image(0, 0, 'painel_madeira').setDisplaySize(520, 130);
    painel.setTint(0xc8d8c8); // leve tom verde
    card.add(painel);

    // Borda superior destacada
    const bordaTopo = this.add.graphics();
    bordaTopo.fillStyle(0x2ecc71, 0.8);
    bordaTopo.fillRect(-260, -65, 520, 3);
    card.add(bordaTopo);

    // Ícone de troféu + título
    card.add(this.add.image(-200, -45, 'icon_trofeu').setScale(0.8));
    card.add(this.add.text(-180, -45, 'SUA POSIÇÃO', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#d4a544',
    }).setOrigin(0, 0.5));

    if (contexto.minhaPosicao === -1 || contexto.meuScore === 0) {
      card.add(
        this.add
          .text(0, 0, 'Você ainda não marcou pontos.\nVença uma fase para entrar no ranking!', {
            fontFamily: 'MedievalSharp, serif',
            fontSize: '13px',
            color: '#f5e6c8',
            align: 'center',
          })
          .setOrigin(0.5)
      );
      return;
    }

    // Posição destacada
    card.add(
      this.add.text(0, -20, `#${contexto.minhaPosicao}`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#fff0a0',
        stroke: '#000000',
        strokeThickness: 4,
      }).setOrigin(0.5)
    );

    card.add(
      this.add.text(0, 10, `${contexto.meuScore.toLocaleString('pt-BR')} pontos`, {
        fontFamily: 'Cinzel, serif',
        fontSize: '14px',
        color: '#f5e6c8',
      }).setOrigin(0.5)
    );

    // Contexto: 3 acima e 2 abaixo
    const acima = contexto.acima.slice(-3).reverse();
    const abaixo = contexto.abaixo.slice(0, 2);

    const linhas = [];
    acima.forEach((j, i) => {
      const pos = contexto.minhaPosicao - (acima.length - i);
      linhas.push(`#${pos}  ${j.nickname.substring(0, 12)}  ${j.score} pts`);
    });
    linhas.push(`★ VOCÊ ★  ${contexto.meuScore} pts`);
    abaixo.forEach((j, i) => {
      const pos = contexto.minhaPosicao + (i + 1);
      linhas.push(`#${pos}  ${j.nickname.substring(0, 12)}  ${j.score} pts`);
    });

    card.add(
      this.add.text(0, 45, linhas.join('\n'), {
        fontFamily: 'Cinzel, serif',
        fontSize: '10px',
        color: '#c0c0c0',
        align: 'center',
        lineSpacing: 2,
      }).setOrigin(0.5)
    );
  }

  // ============================================================
  // BOTÃO MEDIEVAL
  // ============================================================
  criarBotaoMedieval(x, y, iconeTexture, texto, corDestaque, callback) {
    const botao = this.add.container(x, y);
    const fundo = this.add.image(0, 0, 'btn_madeira_peq').setDisplaySize(220, 40);
    botao.add(fundo);

    const overlay = this.add.rectangle(0, 0, 200, 32, corDestaque, 0);
    botao.add(overlay);

    const icone = this.add.image(-70, 0, iconeTexture).setScale(0.7);
    botao.add(icone);

    const label = this.add.text(0, 0, texto, {
      fontFamily: 'Cinzel, serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#f5e6c8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    botao.add(label);

    fundo.setInteractive({ useHandCursor: true });
    fundo.on('pointerover', () => {
      this.tweens.add({ targets: botao, scaleX: 1.05, scaleY: 1.05, duration: 100 });
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

  mostrarCarregando(msg) {
    this.esconderCarregando();
    this.loadingOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const fundo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7);
    const texto = this.add
      .text(0, 0, msg, { fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#d4a544' })
      .setOrigin(0.5);
    this.loadingOverlay.add([fundo, texto]);
  }

  esconderCarregando() {
    if (this.loadingOverlay) {
      this.loadingOverlay.destroy();
      this.loadingOverlay = null;
    }
  }
}
