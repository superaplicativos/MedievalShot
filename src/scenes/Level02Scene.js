// ============================================================
// Medieval Kingshot - Level02Scene (Ogros + Ogros Blindados)
// ============================================================
// FASE 2: Mais difícil que a Fase 1.
//   - Mistura de ogros e goblins (75% ogros / 25% goblins)
//   - Últimos 15 segundos: surge Ogro Blindado (boss)
//   - Torre com mais HP (120), atira mais rápido (800ms)
//   - Vitória: sobreviver 75s ou matar 20 inimigos
// ============================================================

import Phaser from 'phaser';
import Tower from '../objects/Tower.js';
import Enemy, { TIPOS_INIMIGO } from '../objects/Enemy.js';
import Projectile from '../objects/Projectile.js';
import { submeterScore } from '../firebase.js';

const CONFIG_FASE = {
  torreHp: 120,
  torreIntervaloTiro: 800,
  torreDanoFlecha: 30,
  inimigoPrincipal: TIPOS_INIMIGO.ogro,
  inimigoSecundario: TIPOS_INIMIGO.goblin,
  inimigoBoss: TIPOS_INIMIGO.ogroBlindado,
  inimigoIntervalo: 2500,
  tempoSobrevivencia: 75000, // 75s
  killsParaVencer: 20,
  recompensaMoedasBase: 250,
  bonusVitoria: 500,
  numeroFase: 2,
  proximaFase: 'MenuScene', // Por enquanto volta ao menu (pode adicionar Fase 3)
  corTema: '#3a2a1a',
  corFundo: 0x3a2a1a,
  corTexto: '#e74c3c',
  tituloFase: 'FASE 2: FÚRIA DOS OGROS',
  tempoBoss: 60000, // boss surge aos 60s
};

export default class Level02Scene extends Phaser.Scene {
  constructor() {
    super({ key: 'Level02Scene' });
  }

  create() {
    console.log('[Level02Scene] Iniciando Fase 2 - Ogros');

    this.configFase = CONFIG_FASE;
    this.tempoInicio = this.time.now;
    this.kills = 0;
    this.moedas = 0;
    this.scoreFase = 0;
    this.jogoEncerrado = false;
    this.bossSurgiu = false;

    // --------------------------------------------------------
    // Fundo (terra queimada)
    // --------------------------------------------------------
    this.cameras.main.setBackgroundColor(this.configFase.corFundo);

    const fundo = this.add.graphics();
    fundo.fillStyle(0x4a3a2a, 0.4);
    for (let x = 0; x < 800; x += 80) {
      for (let y = 0; y < 600; y += 80) {
        if ((x / 80 + y / 80) % 2 === 0) fundo.fillRect(x, y, 80, 80);
      }
    }
    // Manchas de fogo
    for (let i = 0; i < 8; i++) {
      fundo.fillStyle(0x8a3a1a, 0.4);
      fundo.fillCircle(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550),
        Phaser.Math.Between(15, 35)
      );
    }
    // Crânios decorativos
    for (let i = 0; i < 6; i++) {
      fundo.fillStyle(0xeeeedd, 0.3);
      fundo.fillCircle(Phaser.Math.Between(50, 750), Phaser.Math.Between(50, 550), 4);
    }

    const borda = this.add.graphics();
    borda.lineStyle(8, 0x5a2a10, 1);
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
      alcance: 360,
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
    // Spawner (75% ogros, 25% goblins)
    // --------------------------------------------------------
    this.spawner = this.time.addEvent({
      delay: this.configFase.inimigoIntervalo,
      callback: this.spawnarInimigo,
      callbackScope: this,
      loop: true,
    });

    // --------------------------------------------------------
    // Timer do boss (ogro blindado)
    // --------------------------------------------------------
    this.time.delayedCall(this.configFase.tempoBoss, () => {
      if (!this.jogoEncerrado) this.spawnarBoss();
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

    const isGoblin = Math.random() < 0.25;
    const configInimigo = isGoblin
      ? this.configFase.inimigoSecundario
      : this.configFase.inimigoPrincipal;

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

  /**
   * Spawna o BOSS: Ogro Blindado no centro de uma borda aleatória.
   */
  spawnarBoss() {
    if (this.jogoEncerrado || this.bossSurgiu) return;
    this.bossSurgiu = true;
    console.log('[Level02] BOSS surgindo: Ogro Blindado!');

    // Aviso na tela
    const aviso = this.add
      .text(400, 100, '⚠ OGRO BLINDADO SURGiu! ⚠', {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: '#e74c3c',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(100);

    this.tweens.add({
      targets: aviso,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => aviso.destroy(),
    });

    // Spawna o boss no topo da tela
    const boss = new Enemy(this, 400, -50, this.configFase.inimigoBoss.textura, this.configFase.inimigoBoss);
    this.inimigos.add(boss);
    boss.moverPara(this.torre);

    // Boss é maior visualmente
    boss.setScale(1.3);
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

    this.submeterResultado(false);
    this.mostrarTelaFim('DERROTA!', '#e74c3c', 'Os ogros esmagaram sua torre!', false);
  }

  onEnemyKilled(inimigo) {
    this.kills++;
    this.moedas += inimigo.recompensa;
    this.scoreFase += inimigo.scoreValue || inimigo.recompensa;
    this.atualizarHUD();

    if (this.kills >= this.configFase.killsParaVencer) {
      this.vitoria();
    }
  }

  async submeterResultado(venceu) {
    const tempoSobrevivencia = this.time.now - this.tempoInicio;
    const bonusVitoria = venceu ? this.configFase.bonusVitoria : 0;
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
      console.log('[Level02] Score submetido:', this.ultimoResultado);
    } catch (e) {
      console.error('[Level02] Erro ao submeter score:', e);
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
      `Você derrotou os ogros!\n+${this.configFase.recompensaMoedasBase} moedas + ${this.configFase.bonusVitoria} pts de bônus`,
      true
    );
  }

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

    // ----- Tempo (centro) -----
    const tempoContainer = this.add.container(400, 25).setDepth(51);
    tempoContainer.add(this.add.image(-40, 0, 'icon_relogio').setScale(0.7));
    this.hudTempo = this.add.text(0, 0, '75s', {
      fontFamily: 'Cinzel, serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#e74c3c',
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

    // Botão Menu
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
            color: '#e74c3c',
          }
        )
        .setOrigin(0.5)
    );

    if (this.ultimoResultado) {
      overlay.add(
        this.add
          .text(0, -10, `🎯 Score ganho: +${this.ultimoResultado.scoreGanho} pts`, {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#2ecc71',
            stroke: '#000000',
            strokeThickness: 2,
          })
          .setOrigin(0.5)
      );

      if (this.ultimoResultado.posicaoRanking > 0) {
        overlay.add(
          this.add
            .text(0, 15, `🏆 Sua posição no ranking: #${this.ultimoResultado.posicaoRanking}`, {
              fontFamily: 'Georgia, serif',
              fontSize: '14px',
              color: '#9b59b6',
              stroke: '#000000',
              strokeThickness: 2,
            })
            .setOrigin(0.5)
        );
      }
    }

    // Botões
    if (venceu) {
      const btnRanking = this.add.rectangle(0, 75, 240, 45, 0x9b59b6, 0.9);
      btnRanking.setStrokeStyle(2, 0x000000, 0.6);
      btnRanking.setInteractive({ useHandCursor: true });
      btnRanking.on('pointerdown', () => this.scene.start('RankingScene'));
      overlay.add(btnRanking);
      overlay.add(
        this.add
          .text(0, 75, '🏆 VER RANKING', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#ffffff',
          })
          .setOrigin(0.5)
      );

      const btnMenu = this.add.rectangle(0, 130, 240, 35, 0x2ecc71, 0.9);
      btnMenu.setStrokeStyle(2, 0x000000, 0.6);
      btnMenu.setInteractive({ useHandCursor: true });
      btnMenu.on('pointerdown', () => this.scene.start('MenuScene'));
      overlay.add(btnMenu);
      overlay.add(
        this.add
          .text(0, 130, '☰ MENU PRINCIPAL', {
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
