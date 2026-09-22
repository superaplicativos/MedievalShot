// ============================================================
// Medieval Kingshot - RankingScene
// ============================================================
// Tela dedicada do Ranking Global:
//   - Top 10 jogadores (medalhas para top 3)
//   - Posição do jogador atual
//   - 5 jogadores acima e 5 abaixo (contexto)
//   - Estatísticas globais (total de jogadores, maior score)
//   - Botão "Voltar"
// ============================================================

import Phaser from 'phaser';
import {
  loginAnonimo,
  carregarProgresso,
  getTop10,
  getRankingContexto,
  getEstatisticasGlobais,
  firebaseConfigurado,
} from '../firebase.js';

export default class RankingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'RankingScene' });
  }

  async create() {
    const largura = this.scale.width;
    const altura = this.scale.height;

    this.cameras.main.setBackgroundColor('#1a1410');

    // Brasas
    for (let i = 0; i < 20; i++) {
      const estrela = this.add.circle(
        Phaser.Math.Between(0, largura),
        Phaser.Math.Between(0, altura),
        Phaser.Math.Between(1, 3),
        0x9b59b6,
        Phaser.Math.FloatBetween(0.15, 0.5)
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
      .text(largura / 2, 40, '🏆 RANKING GLOBAL', {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#9b59b6',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(largura / 2, 75, 'Os melhores guerreiros do reino', {
        fontFamily: 'Georgia, serif',
        fontSize: '14px',
        color: '#9a8a6a',
      })
      .setOrigin(0.5);

    // --------------------------------------------------------
    // Loading
    // --------------------------------------------------------
    this.mostrarCarregando('Carregando ranking...');

    try {
      await loginAnonimo();
      const [top10, contexto, stats] = await Promise.all([
        getTop10(),
        getRankingContexto(),
        getEstatisticasGlobais(),
      ]);

      this.esconderCarregando();

      // Renderiza as seções
      this.renderizarEstatisticas(stats);
      this.renderizarTop10(top10);
      this.renderizarMeuRanking(contexto);
    } catch (e) {
      console.error('[RankingScene] Erro:', e);
      this.esconderCarregando();
      this.add
        .text(largura / 2, altura / 2, 'Erro ao carregar ranking. Tente novamente.', {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          color: '#e74c3c',
        })
        .setOrigin(0.5);
    }

    // Botão Voltar
    this.criarBotao(largura / 2, altura - 35, '← VOLTAR AO MENU', '#7f8c8d', () => {
      this.scene.start('MenuScene');
    });
  }

  // --------------------------------------------------------
  // ESTATÍSTICAS GLOBAIS (faixa superior)
  // --------------------------------------------------------
  renderizarEstatisticas(stats) {
    const largura = this.scale.width;
    const card = this.add.container(largura / 2, 110);

    const fundo = this.add.rectangle(0, 0, 460, 40, 0x2a2018, 0.9);
    fundo.setStrokeStyle(2, 0x9b59b6, 0.6);
    card.add(fundo);

    card.add(
      this.add
        .text(
          0,
          0,
          `👥 ${stats.totalJogadores} jogadores  |  🏆 Maior score: ${stats.maiorScore.toLocaleString('pt-BR')}`,
          {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f5e6c8',
          }
        )
        .setOrigin(0.5)
    );
  }

  // --------------------------------------------------------
  // TOP 10 (central)
  // --------------------------------------------------------
  renderizarTop10(top10) {
    const largura = this.scale.width;

    // Painel
    const cardTop10 = this.add.container(largura / 2, 245);
    const fundo = this.add.rectangle(0, 0, 460, 260, 0x2a2018, 0.92);
    fundo.setStrokeStyle(3, 0x9b59b6, 0.7);
    cardTop10.add(fundo);

    cardTop10.add(
      this.add
        .text(0, -115, '🥇 TOP 10 GUERREIROS', {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#d4a544',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
    );

    if (top10.length === 0) {
      cardTop10.add(
        this.add
          .text(
            0,
            0,
            'Nenhum guerreiro no ranking ainda.\nSeja o primeiro a marcar pontos!',
            {
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              color: '#9a8a6a',
              align: 'center',
            }
          )
          .setOrigin(0.5)
      );
      return;
    }

    // Cabeçalho
    const headerY = -90;
    cardTop10.add(
      this.add
        .text(-200, headerY, '#', {
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          color: '#9a8a6a',
        })
        .setOrigin(0, 0.5)
    );
    cardTop10.add(
      this.add
        .text(-170, headerY, 'NICKNAME', {
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          color: '#9a8a6a',
        })
        .setOrigin(0, 0.5)
    );
    cardTop10.add(
      this.add
        .text(120, headerY, 'SCORE', {
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          color: '#9a8a6a',
        })
        .setOrigin(0, 0.5)
    );
    cardTop10.add(
      this.add
        .text(190, headerY, 'LVL', {
          fontFamily: 'Courier New, monospace',
          fontSize: '12px',
          color: '#9a8a6a',
        })
        .setOrigin(0, 0.5)
    );

    // Lista de jogadores
    top10.forEach((jogador, i) => {
      const y = -70 + i * 20;
      const medalha = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`;
      const cor = i === 0 ? '#d4a544' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : '#f5e6c8';

      cardTop10.add(
        this.add
          .text(-200, y, medalha, {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: cor,
          })
          .setOrigin(0, 0.5)
      );

      const nick = (jogador.nickname || 'Anônimo').substring(0, 16);
      cardTop10.add(
        this.add
          .text(-170, y, nick, {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: cor,
          })
          .setOrigin(0, 0.5)
      );

      cardTop10.add(
        this.add
          .text(120, y, `${(jogador.score || 0).toLocaleString('pt-BR')}`, {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: cor,
          })
          .setOrigin(0, 0.5)
      );

      cardTop10.add(
        this.add
          .text(190, y, `${jogador.level || 1}`, {
            fontFamily: 'Courier New, monospace',
            fontSize: '13px',
            color: cor,
          })
          .setOrigin(0, 0.5)
      );
    });
  }

  // --------------------------------------------------------
  // MINHA POSIÇÃO NO RANKING (rodapé)
  // --------------------------------------------------------
  renderizarMeuRanking(contexto) {
    const largura = this.scale.width;
    const card = this.add.container(largura / 2, 430);

    const fundo = this.add.rectangle(0, 0, 460, 130, 0x2a2018, 0.95);
    fundo.setStrokeStyle(3, 0x2ecc71, 0.7);
    card.add(fundo);

    card.add(
      this.add
        .text(0, -50, '🎯 SUA POSIÇÃO', {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          color: '#2ecc71',
          stroke: '#000000',
          strokeThickness: 2,
        })
        .setOrigin(0.5)
    );

    if (contexto.minhaPosicao === -1 || contexto.meuScore === 0) {
      card.add(
        this.add
          .text(
            0,
            0,
            'Você ainda não marcou pontos.\nVença uma fase para entrar no ranking!',
            {
              fontFamily: 'Georgia, serif',
              fontSize: '13px',
              color: '#9a8a6a',
              align: 'center',
            }
          )
          .setOrigin(0.5)
      );
      return;
    }

    card.add(
      this.add
        .text(
          0,
          -20,
          `#${contexto.minhaPosicao}  •  Score: ${contexto.meuScore.toLocaleString('pt-BR')} pts`,
          {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 2,
          }
        )
        .setOrigin(0.5)
    );

    // Contexto: jogadores próximos
    const acima = contexto.acima.slice(-3).reverse(); // 3 imediatamente acima
    const abaixo = contexto.abaixo.slice(0, 2); // 2 imediatamente abaixo

    const linhas = [];
    acima.forEach((j, i) => {
      const pos = contexto.minhaPosicao - (acima.length - i);
      linhas.push(`#${pos}  ${j.nickname.substring(0, 12)}  -  ${j.score} pts`);
    });
    linhas.push(`# ${contexto.minhaPosicao}  ★ VOCÊ ★  -  ${contexto.meuScore} pts`);
    abaixo.forEach((j, i) => {
      const pos = contexto.minhaPosicao + (i + 1);
      linhas.push(`#${pos}  ${j.nickname.substring(0, 12)}  -  ${j.score} pts`);
    });

    card.add(
      this.add
        .text(
          0,
          20,
          linhas.join('\n'),
          {
            fontFamily: 'Courier New, monospace',
            fontSize: '11px',
            color: '#f5e6c8',
            align: 'center',
            lineSpacing: 2,
          }
        )
        .setOrigin(0.5)
    );
  }

  // --------------------------------------------------------
  // UTILITÁRIOS
  // --------------------------------------------------------
  criarBotao(x, y, texto, corHex, callback) {
    const cor = Phaser.Display.Color.HexStringToColor(corHex).color;
    const botao = this.add.container(x, y);
    const fundo = this.add.rectangle(0, 0, 240, 40, cor, 0.85);
    fundo.setStrokeStyle(2, 0x000000, 0.6);
    botao.add(fundo);
    const label = this.add
      .text(0, 0, texto, {
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
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
    });
    fundo.on('pointerout', () => {
      fundo.setFillStyle(cor, 0.85);
      fundo.setScale(1);
    });
    fundo.on('pointerdown', callback);
    return botao;
  }

  mostrarCarregando(msg) {
    this.esconderCarregando();
    this.loadingOverlay = this.add.container(this.scale.width / 2, this.scale.height / 2);
    const fundo = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.7);
    const texto = this.add
      .text(0, 0, msg, { fontFamily: 'Georgia, serif', fontSize: '22px', color: '#9b59b6' })
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
