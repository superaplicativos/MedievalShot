// ============================================================
// Medieval Kingshot - Level01Scene (Goblins)
// ============================================================
// FASE 1: Single-player puro.
//   - Arena 800x600
//   - Torre no centro (HP 100)
//   - Goblins surgem a cada 2s nas bordas
//   - Torre atira flecha a cada 1s no inimigo mais próximo
//   - Vitória: sobreviver 60s ou matar 30 goblins
//   - Ao vencer: submete score ao ranking + desbloqueia Fase 2
// ============================================================

import Phaser from 'phaser';
import Tower from '../objects/Tower.js';
import Enemy, { TIPOS_INIMIGO } from '../objects/Enemy.js';
import Projectile from '../objects/Projectile.js';
import { submeterScore } from '../firebase.js';

const CONFIG_FASE = {
  torreHp: 100,
  torreIntervaloTiro: 1000,
  torreDanoFlecha: 25,
  inimigoTipo: TIPOS_INIMIGO.goblin,
  inimigoIntervalo: 2000,
  tempoSobrevivencia: 60000, // 60s
  killsParaVencer: 30,
  recompensaMoedasBase: 100,
  numeroFase: 1,
  proximaFase: 'Level02Scene',
  corTema: '#3a5a2a',
  corFundo: 0x3a5a2a,
  corTexto: '#d4a544',
  tituloFase: 'FASE 1: ATAQUE DOS GOBLINS',
};

export default class Level01Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level01Scene' });
  }

  create() {
    console.log('[Level01Scene] Iniciando Fase 1 - Goblins');

    this.configFase = CONFIG_FASE;
    this.tempoInicio = this.time.now;
    this.kills = 0;
    this.moedas = 0;
    this.scoreFase = 0;
    this.jogoEncerrado = false;

    // --------------------------------------------------------
    // Fundo (grama medieval)
    // --------------------------------------------------------
    this.cameras.main.setBackgroundColor(this.configFase.corFundo);

    const fundo = this.add.graphics();
    fundo.fillStyle(0x4a6a3a, 0.4);
    for (let x = 0; x < 800; x += 80) {
      for (let y = 0; y < 600; y += 80) {
        if ((x / 80 + y / 80) % 2 === 0) fundo.fillRect(x, y, 80, 80);
      }
    }
    for (let i = 0; i < 12; i++) {
      fundo.fillStyle(0x2a4a1a, 0.3);
      fundo.fillCircle(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        Phaser.Math.Between(15, 35)
      );
    }

    const borda = this.add.graphics();
    borda.lineStyle(8, 0x5a3a20, 1);
    borda.strokeRect(4, 4, 792, 592);

    // --------------------------------------------------------
    // Grupos
    // --------------------------------------------------------
    this.inimigos = this.physics.add.group();
    this.projeteis = this.physics.add.group();

    // --------------------------------------------------------
    // Torre
    // --------------------------------------------------------
    this.torre = new Tower(this, 400, 300, {
      hp: this.configFase.torreHp,
      intervaloTiro: this.configFase.torreIntervaloTiro,
      danoFlecha: this.configFase.torreDanoFlecha,
      alcance: 320,
    });

    // --------------------------------------------------------
    // Colisões
    // --------------------------------------------------------
    this.physics.add.overlap(this.inimigos, this.torre, (inimigo, torre) => {
      if (inimigo.estaMorto) return;
      torre.receberDano(inimigo.dano);
      inimigo.morrer();
    });

    this.physics.add.overlap(this.projeteis, this.inimigos, (flecha, inimigo) => {
      if (!flecha.active || !inimigo.active) return;
      flecha.bater(inimigo);
    });

    // --------------------------------------------------------
    // HUD
    // --------------------------------------------------------
    this.criarHUD();

    // --------------------------------------------------------
    // Spawner
    // --------------------------------------------------------
    this.spawner = this.time.addEvent({
      delay: this.configFase.inimigoIntervalo,
      callback: this.spawnarInimigo,
      callbackScope: this,
      loop: true,
    });

    // --------------------------------------------------------
    // Intro
    // --------------------------------------------------------
    const textoIntro = this.add
      .text(400, 250, this.configFase.tituloFase, {
        fontFamily: 'Georgia, serif',
        fontSize: '32px',
        color: this.configFase.corTexto,
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(100);

    this.tweens.add({
      targets: textoIntro,
      alpha: 1,
      duration: 500,
      yoyo: true,
      hold: 1000,
      onComplete: () => textoIntro.destroy(),
    });

    // Timer de vitória
    this.time.delayedCall(this.configFase.tempoSobrevivencia, () => {
      if (!this.jogoEncerrado) this.vitoria();
    });
  }

  spawnarInimigo() {
    if (this.jogoEncerrado) return;

    const configInimigo = this.configFase.inimigoTipo;
    const lado = Phaser.Math.Between(0, 3);
    let x, y;
    switch (lado) {
      case 0:
        x = Phaser.Math.Between(50, 750);
        y = -30;
        break;
      case 1:
        x = 830;
        y = Phaser.Math.Between(50, 550);
        break;
      case 2:
        x = Phaser.Math.Between(50, 750);
        y = 630;
        break;
      case 3:
        x = -30;
        y = Phaser.Math.Between(50, 550);
        break;
    }

    const inimigo = new Enemy(this, x, y, configInimigo.textura, configInimigo);
    this.inimigos.add(inimigo);
    inimigo.moverPara(this.torre);
  }

  criarProjetil(x, y, alvo, dano) {
    const flecha = new Projectile(this, x, y, alvo, dano);
    this.projeteis.add(flecha);
  }

  // --------------------------------------------------------
  // CALLBACKS
  // --------------------------------------------------------
  onTowerDamaged() {
    this.atualizarHUD();
  }

  onDerrota() {
    if (this.jogoEncerrado) return;
    this.jogoEncerrado = true;
    this.spawner.remove();

    // Mesmo perdendo, submete o score que ganhou até aqui
    this.submeterResultado(false);

    this.mostrarTelaFim('DERROTA!', '#e74c3c', 'Os goblins invadiram sua torre!', false);
  }

  onEnemyKilled(inimigo) {
    if (!inimigo.estaMorto) return;
    this.kills++;
    this.moedas += inimigo.recompensa;
    this.scoreFase += inimigo.scoreValue || inimigo.recompensa;
    this.atualizarHUD();

    if (this.kills >= this.configFase.killsParaVencer) {
      this.vitoria();
    }
  }

  // --------------------------------------------------------
  // SUBMISSÃO DE SCORE AO RANKING
  // --------------------------------------------------------
  async submeterResultado(venceu) {
    const tempoSobrevivencia = this.time.now - this.tempoInicio;
    const bonusVitoria = venceu ? 200 : 0;
    const scoreTotal = this.scoreFase + bonusVitoria;
    const moedasTotal = this.moedas + (venceu ? this.configFase.recompensaMoedasBase : 0);

    const resultado = {
      scoreGanho: scoreTotal,
      kills: this.kills,
      tempoSobrevivenciaMs: tempoSobrevivencia,
      level: venceu ? this.configFase.numeroFase + 1 : this.configFase.numeroFase,
      coins: moedasTotal,
    };

    try {
      const { novoScoreTotal, posicaoRanking } = await submeterScore(resultado);
      this.ultimoResultado = {
        scoreGanho: scoreTotal,
        novoScoreTotal,
        posicaoRanking,
        venceu,
      };
      console.log('[Level01] Score submetido:', this.ultimoResultado);
    } catch (e) {
      console.error('[Level01] Erro ao submeter score:', e);
      this.ultimoResultado = { scoreGanho: scoreTotal, novoScoreTotal: 0, posicaoRanking: -1, venceu };
    }
  }

  async vitoria() {
    if (this.jogoEncerrado) return;
    this.jogoEncerrado = true;
    this.spawner.remove();

    await this.submeterResultado(true);

    this.mostrarTelaFim(
      'VITÓRIA!',
      '#2ecc71',
      `Você resistiu ao ataque goblin!\n+${this.configFase.recompensaMoedasBase} moedas de bônus`,
      true
    );
  }

  // --------------------------------------------------------
  // HUD (painel de madeira medieval)
  // --------------------------------------------------------
  criarHUD() {
    // Painel de madeira no topo
    const hudFundo = this.add.image(400, 25, 'painel_madeira').setDisplaySize(780, 50);
    hudFundo.setDepth(50);

    // ----- Kills (esquerda) -----
    const killsContainer = this.add.container(20, 25).setDepth(51);
    killsContainer.add(this.add.image(0, 0, 'icon_caveira').setScale(0.7));
    this.hudKillsTexto = this.add.text(20, 0, `0/${this.configFase.killsParaVencer}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f5e6c8',
    }).setOrigin(0, 0.5);
    killsContainer.add(this.hudKillsTexto);
    this.hudKillsContainer = killsContainer;

    // ----- Tempo (centro) -----
    const tempoContainer = this.add.container(400, 25).setDepth(51);
    tempoContainer.add(this.add.image(-40, 0, 'icon_relogio').setScale(0.7));
    this.hudTempo = this.add.text(0, 0, '60s', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#d4a544',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);
    tempoContainer.add(this.hudTempo);

    // ----- HP da torre (centro-direita) -----
    const hpContainer = this.add.container(280, 25).setDepth(51);
    hpContainer.add(this.add.image(0, 0, 'icon_escudo').setScale(0.7));
    this.hudHpTexto = this.add.text(20, 0, `${this.configFase.torreHp}/${this.configFase.torreHp}`, {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#2ecc71',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
    hpContainer.add(this.hudHpTexto);
    this.hudHpContainer = hpContainer;

    // ----- Moedas (direita) -----
    const moedasContainer = this.add.container(640, 25).setDepth(51);
    moedasContainer.add(this.add.image(0, 0, 'icon_moeda').setScale(0.7));
    this.hudMoedas = this.add.text(20, 0, '0', {
      fontFamily: 'Cinzel, serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#f5e6c8',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0, 0.5);
    moedasContainer.add(this.hudMoedas);

    // Botão Menu (canto inferior direito)
    const btnMenu = this.add.container(760, 570).setDepth(100);
    const btnMenuFundo = this.add.image(0, 0, 'btn_madeira_peq').setDisplaySize(120, 32);
    btnMenu.add(btnMenuFundo);
    btnMenu.add(this.add.text(0, 0, 'MENU', {
      fontFamily: 'Cinzel, serif',
      fontSize: '12px',
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
  }

  atualizarHUD() {
    this.hudKillsTexto.setText(`${this.kills}/${this.configFase.killsParaVencer}`);
    this.hudMoedas.setText(`${this.moedas}`);
    // Atualiza HP
    if (this.torre && this.hudHpTexto) {
      const hp = this.torre.hp;
      const max = this.torre.maxHp;
      this.hudHpTexto.setText(`${hp}/${max}`);
      const pct = hp / max;
      if (pct > 0.5) this.hudHpTexto.setColor('#2ecc71');
      else if (pct > 0.25) this.hudHpTexto.setColor('#f1c40f');
      else this.hudHpTexto.setColor('#e74c3c');
    }
  }

  mostrarTelaFim(titulo, cor, subtitulo, venceu) {
    const overlay = this.add.container(400, 300);

    const fundo = this.add.rectangle(0, 0, 600, 420, 0x000000, 0.92);
    fundo.setStrokeStyle(4, cor, 0.8);
    overlay.add(fundo);

    overlay.add(
      this.add
        .text(0, -170, titulo, {
          fontFamily: 'Georgia, serif',
          fontSize: '48px',
          color: cor,
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
    );

    overlay.add(
      this.add
        .text(0, -110, subtitulo, {
          fontFamily: 'Georgia, serif',
          fontSize: '16px',
          color: '#f5e6c8',
          align: 'center',
          wordWrap: { width: 540 },
        })
        .setOrigin(0.5)
    );

    // Estatísticas da partida
    const tempoSeg = ((this.time.now - this.tempoInicio) / 1000).toFixed(1);
    overlay.add(
      this.add
        .text(
          0,
          -40,
          `Kills: ${this.kills}   |   Moedas: ${this.moedas}   |   Tempo: ${tempoSeg}s`,
          {
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            color: '#d4a544',
          }
        )
        .setOrigin(0.5)
    );

    // Score ganho nesta partida
    if (this.ultimoResultado) {
      overlay.add(
        this.add
          .text(
            0,
            -10,
            `🎯 Score ganho: +${this.ultimoResultado.scoreGanho} pts`,
            {
              fontFamily: 'Georgia, serif',
              fontSize: '16px',
              color: '#2ecc71',
              stroke: '#000000',
              strokeThickness: 2,
            }
          )
          .setOrigin(0.5)
      );

      if (this.ultimoResultado.posicaoRanking > 0) {
        overlay.add(
          this.add
            .text(
              0,
              15,
              `🏆 Sua posição no ranking: #${this.ultimoResultado.posicaoRanking}`,
              {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                color: '#9b59b6',
                stroke: '#000000',
                strokeThickness: 2,
              }
            )
            .setOrigin(0.5)
        );
      }
    }

    // Botões
    if (venceu) {
      const btnProxima = this.add.rectangle(0, 75, 240, 45, 0x2ecc71, 0.9);
      btnProxima.setStrokeStyle(2, 0x000000, 0.6);
      btnProxima.setInteractive({ useHandCursor: true });
      btnProxima.on('pointerover', () => btnProxima.setFillStyle(0x2ecc71, 1));
      btnProxima.on('pointerout', () => btnProxima.setFillStyle(0x2ecc71, 0.9));
      btnProxima.on('pointerdown', () => this.scene.start(this.configFase.proximaFase));
      overlay.add(btnProxima);
      overlay.add(
        this.add
          .text(0, 75, '➡ PRÓXIMA FASE', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
      );

      const btnRanking = this.add.rectangle(0, 130, 240, 35, 0x9b59b6, 0.9);
      btnRanking.setStrokeStyle(2, 0x000000, 0.6);
      btnRanking.setInteractive({ useHandCursor: true });
      btnRanking.on('pointerdown', () => this.scene.start('RankingScene'));
      overlay.add(btnRanking);
      overlay.add(
        this.add
          .text(0, 130, '🏆 VER RANKING', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
      );
    } else {
      const btnTentar = this.add.rectangle(0, 75, 240, 45, 0xe74c3c, 0.9);
      btnTentar.setStrokeStyle(2, 0x000000, 0.6);
      btnTentar.setInteractive({ useHandCursor: true });
      btnTentar.on('pointerdown', () => this.scene.restart());
      overlay.add(btnTentar);
      overlay.add(
        this.add
          .text(0, 75, '🔄 TENTAR DE NOVO', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
      );

      const btnRanking = this.add.rectangle(0, 130, 240, 35, 0x9b59b6, 0.9);
      btnRanking.setStrokeStyle(2, 0x000000, 0.6);
      btnRanking.setInteractive({ useHandCursor: true });
      btnRanking.on('pointerdown', () => this.scene.start('RankingScene'));
      overlay.add(btnRanking);
      overlay.add(
        this.add
          .text(0, 130, '🏆 VER RANKING', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
      );
    }

    const btnMenu = this.add.rectangle(0, 180, 200, 35, 0x7f8c8d, 0.9);
    btnMenu.setStrokeStyle(2, 0x000000, 0.6);
    btnMenu.setInteractive({ useHandCursor: true });
    btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
    overlay.add(btnMenu);
    overlay.add(
      this.add
        .text(0, 180, '☰ MENU', {
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
    );

    overlay.setDepth(200);
  }

  update(time) {
    if (this.jogoEncerrado) return;

    this.inimigos.getChildren().forEach((inimigo) => {
      inimigo.update(time);
    });

    const decorrido = time - this.tempoInicio;
    const restante = Math.max(0, this.configFase.tempoSobrevivencia - decorrido);
    this.hudTempo.setText(`${(restante / 1000).toFixed(1)}s`);
  }
}
