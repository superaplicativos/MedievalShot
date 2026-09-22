// ============================================================
// Medieval Kingshot - BootScene
// ============================================================
// Gera TODAS as texturas procedurais:
//   - Herói a cavalo (player)
//   - Inimigos (goblins, ogros, ogros blindados)
//   - Torres (arqueiro, canhão, balista, mage)
//   - Moeda, madeira, zona de construção
//   - UI medieval (botões, painéis, ícones)
// ============================================================

import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    console.log('[BootScene] Gerando texturas medievais...');
    this.gerarTexturasJogo();
    this.gerarTexturasUI();
    this.scene.start('PreloadScene');
  }

  // ============================================================
  // SPRITES DO JOGO
  // ============================================================
  gerarTexturasJogo() {
    this.gerarHeroi();
    this.gerarInimigos();
    this.gerarTorres();
    this.gerarProjetil();
    this.gerarMoeda();
    this.gerarMadeira();
    this.gerarZonaConstrucao();
    this.gerarCastelo();
  }

  // ----- Herói a cavalo (visto de cima, armadura azul+prata) -----
  gerarHeroi() {
    if (this.textures.exists('hero')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sombra do cavalo
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(32, 50, 44, 18);

    // ----- Cavalo (marrom) -----
    // Corpo do cavalo
    g.fillStyle(0x6b4423, 1);
    g.fillEllipse(32, 38, 40, 28);
    g.lineStyle(2, 0x3a2410, 1);
    g.strokeEllipse(32, 38, 40, 28);

    // Cabeça do cavalo (na frente)
    g.fillStyle(0x6b4423, 1);
    g.fillEllipse(32, 22, 18, 22);
    g.lineStyle(2, 0x3a2410, 1);
    g.strokeEllipse(32, 22, 18, 22);

    // Crina do cavalo (preto/marrom escuro)
    g.fillStyle(0x2a1808, 1);
    g.fillEllipse(32, 14, 14, 10);
    g.fillRect(28, 12, 8, 8);

    // Orelhas
    g.fillStyle(0x6b4423, 1);
    g.fillTriangle(26, 14, 30, 8, 28, 18);
    g.fillTriangle(38, 14, 34, 8, 36, 18);

    // Olho do cavalo
    g.fillStyle(0x000000, 1);
    g.fillCircle(28, 22, 2);

    // Patas dianteiras
    g.fillStyle(0x3a2410, 1);
    g.fillRect(22, 48, 5, 12);
    g.fillRect(28, 50, 5, 10);

    // Patas traseiras
    g.fillRect(38, 50, 5, 10);
    g.fillRect(44, 48, 5, 12);

    // ----- Cavaleiro (no topo do cavalo) -----
    // Capa azul (atrás do cavaleiro)
    g.fillStyle(0x2c3e8a, 1);
    g.fillEllipse(32, 30, 18, 22);
    g.fillStyle(0x1a2855, 1);
    g.fillEllipse(32, 35, 12, 14);

    // Corpo do cavaleiro (armadura prata)
    g.fillStyle(0xb0b0c0, 1);
    g.fillEllipse(32, 30, 14, 16);
    g.lineStyle(1, 0x606070, 1);
    g.strokeEllipse(32, 30, 14, 16);

    // Highlight armadura
    g.fillStyle(0xe0e0e8, 0.6);
    g.fillEllipse(28, 26, 6, 8);

    // Cabeça do cavaleiro (capacete)
    g.fillStyle(0xb0b0c0, 1);
    g.fillCircle(32, 22, 7);
    g.lineStyle(1, 0x606070, 1);
    g.strokeCircle(32, 22, 7);

    // Penacho do capacete (azul/vermelho)
    g.fillStyle(0xc0392b, 1);
    g.fillEllipse(32, 14, 6, 8);
    g.fillStyle(0x8b1f15, 1);
    g.fillEllipse(32, 16, 4, 6);

    // Viseira (linha preta)
    g.fillStyle(0x000000, 1);
    g.fillRect(28, 22, 8, 2);

    // Braço segurando lança (direita)
    g.fillStyle(0xb0b0c0, 1);
    g.fillRect(40, 28, 5, 12);
    g.fillStyle(0x606070, 1);
    g.fillRect(40, 38, 5, 2);

    // Lança (na diagonal)
    g.fillStyle(0x6b4423, 1);
    g.fillRect(45, 10, 3, 30);
    // Ponta de ferro
    g.fillStyle(0xc0c0c8, 1);
    g.fillTriangle(46.5, 5, 43, 12, 50, 12);
    g.fillStyle(0xe0e0e8, 0.8);
    g.fillTriangle(46.5, 6, 44, 10, 49, 10);

    // Escudo (esquerda)
    g.fillStyle(0x2c3e8a, 1);
    g.fillEllipse(22, 32, 10, 14);
    g.lineStyle(2, 0xd4a544, 1);
    g.strokeEllipse(22, 32, 10, 14);
    // Cruz no escudo
    g.fillStyle(0xd4a544, 1);
    g.fillRect(20.5, 28, 3, 8);
    g.fillRect(17, 31, 10, 3);

    g.generateTexture('hero', 64, 64);
    g.destroy();
  }

  // ----- Inimigos -----
  gerarInimigos() {
    // Goblin (pequeno, verde)
    if (!this.textures.exists('enemy_goblin')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 28, 20, 8);
      // Corpo
      g.fillStyle(0x88cc44, 1);
      g.fillEllipse(16, 20, 22, 18);
      g.lineStyle(1, 0x558822, 1);
      g.strokeEllipse(16, 20, 22, 18);
      // Cabeça
      g.fillCircle(16, 12, 9);
      g.lineStyle(1, 0x558822, 1);
      g.strokeCircle(16, 12, 9);
      // Orelhas
      g.fillStyle(0x88cc44, 1);
      g.fillTriangle(8, 12, 4, 8, 8, 16);
      g.fillTriangle(24, 12, 28, 8, 24, 16);
      // Olhos amarelos
      g.fillStyle(0xffdd00, 1);
      g.fillCircle(12, 12, 2);
      g.fillCircle(20, 12, 2);
      g.fillStyle(0x000000, 1);
      g.fillCircle(12, 12, 1);
      g.fillCircle(20, 12, 1);
      // Boca malvada
      g.fillStyle(0x000000, 1);
      g.fillRect(13, 16, 6, 2);
      // Braço
      g.fillStyle(0x88cc44, 1);
      g.fillRect(20, 18, 8, 4);
      // Pedra
      g.fillStyle(0x808080, 1);
      g.fillCircle(28, 20, 4);
      g.generateTexture('enemy_goblin', 32, 32);
      g.destroy();
    }

    // Ogro (médio, verde escuro)
    if (!this.textures.exists('enemy_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(24, 42, 32, 10);
      // Corpo
      g.fillStyle(0x5a8a3a, 1);
      g.fillEllipse(24, 30, 30, 24);
      g.lineStyle(2, 0x3a5a1a, 1);
      g.strokeEllipse(24, 30, 30, 24);
      // Cabeça
      g.fillCircle(24, 18, 11);
      g.lineStyle(2, 0x3a5a1a, 1);
      g.strokeCircle(24, 18, 11);
      // Olhos vermelhos
      g.fillStyle(0xff3300, 1);
      g.fillCircle(20, 17, 2.5);
      g.fillCircle(28, 17, 2.5);
      g.fillStyle(0xffaaaa, 0.6);
      g.fillCircle(20, 16, 1);
      g.fillCircle(28, 16, 1);
      // Sobrancelhas
      g.fillStyle(0x3a5a1a, 1);
      g.fillRect(17, 13, 6, 2);
      g.fillRect(25, 13, 6, 2);
      // Boca + presas
      g.fillStyle(0x000000, 1);
      g.fillRect(20, 22, 8, 3);
      g.fillStyle(0xffffff, 1);
      g.fillTriangle(21, 22, 23, 22, 22, 26);
      g.fillTriangle(26, 22, 28, 22, 27, 26);
      // Braço com clava
      g.fillStyle(0x5a8a3a, 1);
      g.fillRect(34, 24, 8, 5);
      // Clava
      g.fillStyle(0x6b4423, 1);
      g.fillRect(40, 10, 5, 22);
      g.fillCircle(42, 8, 7);
      g.lineStyle(1, 0x3a2410, 1);
      g.strokeCircle(42, 8, 7);
      g.generateTexture('enemy_ogre', 48, 48);
      g.destroy();
    }

    // Ogro Blindado (grande, armadura)
    if (!this.textures.exists('enemy_armored_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.5);
      g.fillEllipse(24, 44, 36, 10);
      // Corpo com armadura
      g.fillStyle(0x9a8a7a, 1);
      g.fillEllipse(24, 30, 32, 26);
      g.lineStyle(2, 0x4a3a2a, 1);
      g.strokeEllipse(24, 30, 32, 26);
      // Detalhes armadura (rivets)
      g.fillStyle(0x4a3a2a, 1);
      [[14, 22], [34, 22], [14, 38], [34, 38]].forEach(([x, y]) => {
        g.fillCircle(x, y, 1.5);
      });
      // Capacete com chifres
      g.fillStyle(0x4a3a2a, 1);
      g.fillRect(14, 8, 20, 12);
      g.fillEllipse(24, 14, 20, 8);
      // Chifres
      g.fillStyle(0xeeeedd, 1);
      g.fillTriangle(14, 12, 8, 4, 16, 14);
      g.fillTriangle(34, 12, 40, 4, 32, 14);
      // Fenda do capacete
      g.fillStyle(0x000000, 1);
      g.fillRect(18, 14, 12, 2);
      // Olhos vermelhos brilhantes
      g.fillStyle(0xff0000, 1);
      g.fillCircle(21, 14, 1.5);
      g.fillCircle(27, 14, 1.5);
      // Clava blindada (com bandas)
      g.fillStyle(0x6b4423, 1);
      g.fillRect(36, 16, 5, 22);
      g.fillStyle(0x9a8a7a, 1);
      g.fillRect(35, 18, 7, 3);
      g.fillRect(35, 26, 7, 3);
      g.fillRect(35, 34, 7, 3);
      g.generateTexture('enemy_armored_ogre', 48, 48);
      g.destroy();
    }
  }

  // ----- Torres (4 tipos: arqueiro, canhão, balista, mago) -----
  gerarTorres() {
    // Torre de Arqueiro (madeira + pedra)
    if (!this.textures.exists('tower_archer')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 28, 24, 8);
      // Base de pedra
      g.fillStyle(0x7a7a80, 1);
      g.fillRect(6, 16, 20, 12);
      g.lineStyle(1, 0x4a4a50, 1);
      g.strokeRect(6, 16, 20, 12);
      // Tijolos
      g.lineStyle(1, 0x4a4a50, 0.5);
      g.lineBetween(6, 20, 26, 20);
      g.lineBetween(6, 24, 26, 24);
      g.lineBetween(12, 16, 12, 20);
      g.lineBetween(20, 20, 20, 24);
      g.lineBetween(12, 24, 12, 28);
      g.lineBetween(20, 24, 20, 28);
      // Torre de madeira
      g.fillStyle(0x6b4423, 1);
      g.fillRect(8, 4, 16, 14);
      g.lineStyle(1, 0x3a2410, 1);
      g.strokeRect(8, 4, 16, 14);
      // Ameias (topo)
      g.fillStyle(0x6b4423, 1);
      g.fillRect(8, 0, 4, 6);
      g.fillRect(14, 0, 4, 6);
      g.fillRect(20, 0, 4, 6);
      // Janela
      g.fillStyle(0x000000, 1);
      g.fillRect(13, 10, 6, 6);
      // Arqueiro no topo (cabeça)
      g.fillStyle(0xb0b0c0, 1);
      g.fillCircle(16, 8, 3);
      // Arco
      g.lineStyle(2, 0x6b4423, 1);
      g.strokeCircle(16, 8, 5);
      g.generateTexture('tower_archer', 32, 32);
      g.destroy();
    }

    // Torre de Canhão (ferro)
    if (!this.textures.exists('tower_cannon')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 28, 26, 8);
      // Base de pedra (mais larga)
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(4, 14, 24, 14);
      g.lineStyle(1, 0x3a3a3f, 1);
      g.strokeRect(4, 14, 24, 14);
      // Tijolos
      g.lineStyle(1, 0x3a3a3f, 0.5);
      g.lineBetween(4, 20, 28, 20);
      g.lineBetween(4, 25, 28, 25);
      // Estrutura de ferro
      g.fillStyle(0x5a5a60, 1);
      g.fillRect(8, 4, 16, 12);
      g.lineStyle(1, 0x2a2a30, 1);
      g.strokeRect(8, 4, 16, 12);
      // Rebites
      g.fillStyle(0x2a2a30, 1);
      g.fillCircle(10, 6, 1);
      g.fillCircle(22, 6, 1);
      g.fillCircle(10, 14, 1);
      g.fillCircle(22, 14, 1);
      // Canhão
      g.fillStyle(0x3a3a3f, 1);
      g.fillCircle(16, 10, 6);
      g.fillStyle(0x1a1a1f, 1);
      g.fillCircle(16, 10, 3);
      // Highlight
      g.fillStyle(0x6a6a70, 0.6);
      g.fillCircle(14, 8, 2);
      g.generateTexture('tower_cannon', 32, 32);
      g.destroy();
    }

    // Torre de Balista (madeira grande)
    if (!this.textures.exists('tower_ballista')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 28, 28, 8);
      // Base de pedra
      g.fillStyle(0x7a7a80, 1);
      g.fillRect(4, 16, 24, 12);
      g.lineStyle(1, 0x4a4a50, 1);
      g.strokeRect(4, 16, 24, 12);
      // Estrutura de madeira
      g.fillStyle(0x8b5a2b, 1);
      g.fillRect(6, 6, 20, 12);
      g.lineStyle(1, 0x4a2e10, 1);
      g.strokeRect(6, 6, 20, 12);
      // Balista (arma)
      // Braço da balista
      g.fillStyle(0x6b4423, 1);
      g.fillRect(14, 2, 4, 18);
      // Corda
      g.lineStyle(1, 0xeeeedd, 1);
      g.lineBetween(8, 10, 16, 4);
      g.lineBetween(24, 10, 16, 4);
      // Seta (carregada)
      g.fillStyle(0x3a3a3f, 1);
      g.fillRect(15, 0, 2, 8);
      g.fillTriangle(16, -2, 13, 2, 19, 2);
      // Rodas
      g.fillStyle(0x3a2410, 1);
      g.fillCircle(8, 24, 4);
      g.fillCircle(24, 24, 4);
      g.fillStyle(0x6b4423, 1);
      g.fillCircle(8, 24, 2);
      g.fillCircle(24, 24, 2);
      g.generateTexture('tower_ballista', 32, 32);
      g.destroy();
    }

    // Torre Mágica (roxa, cristal)
    if (!this.textures.exists('tower_mage')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(16, 28, 24, 8);
      // Base de pedra
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(6, 18, 20, 10);
      g.lineStyle(1, 0x3a3a3f, 1);
      g.strokeRect(6, 18, 20, 10);
      // Torre cônica roxa
      g.fillStyle(0x6a3a8a, 1);
      g.fillTriangle(8, 18, 24, 18, 16, 2);
      g.lineStyle(1, 0x3a1a5a, 1);
      g.strokeTriangle(8, 18, 24, 18, 16, 2);
      // Cristal no topo
      g.fillStyle(0xaa66dd, 1);
      g.fillTriangle(16, 0, 13, 6, 19, 6);
      g.fillStyle(0xddaaff, 0.6);
      g.fillTriangle(16, 1, 14, 4, 18, 4);
      // Brilho mágico
      g.fillStyle(0xddaaff, 0.4);
      g.fillCircle(16, 12, 5);
      g.fillStyle(0xddaaff, 0.2);
      g.fillCircle(16, 12, 8);
      // Runa (símbolo mágico)
      g.fillStyle(0xddaaff, 1);
      g.fillCircle(16, 14, 2);
      g.generateTexture('tower_mage', 32, 32);
      g.destroy();
    }
  }

  // ----- Projétil (flecha) -----
  gerarProjetil() {
    if (this.textures.exists('arrow')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x3a2a1a, 1);
    g.fillRect(7, 8, 4, 14);
    g.fillStyle(0xcccccc, 1);
    g.fillTriangle(9, 2, 5, 8, 13, 8);
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(7, 22, 11, 22, 9, 28);
    g.generateTexture('arrow', 18, 30);
    g.destroy();
  }

  // ----- Moeda -----
  gerarMoeda() {
    if (this.textures.exists('coin')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Sombra
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(10, 18, 14, 5);
    // Moeda
    g.fillStyle(0xd4a544, 1);
    g.fillCircle(10, 10, 8);
    g.lineStyle(1, 0xa07820, 1);
    g.strokeCircle(10, 10, 8);
    // Borda interna
    g.lineStyle(1, 0xa07820, 0.8);
    g.strokeCircle(10, 10, 6);
    // Símbolo ($) estilizado
    g.fillStyle(0xa07820, 1);
    g.fillRect(9, 5, 2, 10);
    g.fillRect(7, 7, 6, 1);
    g.fillRect(7, 12, 6, 1);
    // Highlight
    g.fillStyle(0xfff0a0, 0.9);
    g.fillCircle(7, 7, 2);
    g.generateTexture('coin', 20, 20);
    g.destroy();
  }

  // ----- Madeira (tronco) -----
  gerarMadeira() {
    if (this.textures.exists('wood')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Sombra
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(10, 18, 14, 5);
    // Tronco
    g.fillStyle(0x6b4423, 1);
    g.fillCircle(10, 10, 8);
    g.lineStyle(1, 0x3a2410, 1);
    g.strokeCircle(10, 10, 8);
    // Anéis do tronco
    g.lineStyle(1, 0x4a2e15, 0.8);
    g.strokeCircle(10, 10, 5);
    g.strokeCircle(10, 10, 2);
    // Centro
    g.fillStyle(0x4a2e15, 1);
    g.fillCircle(10, 10, 1);
    g.generateTexture('wood', 20, 20);
    g.destroy();
  }

  // ----- Zona de construção (quadrado tracejado com custo) -----
  gerarZonaConstrucao() {
    if (this.textures.exists('buildzone')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Quadrado tracejado dourado
    g.lineStyle(3, 0xd4a544, 0.9);
    g.strokeRect(2, 2, 60, 60);
    // Cantos mais fortes
    g.lineStyle(4, 0xd4a544, 1);
    // Canto superior esquerdo
    g.lineBetween(2, 2, 12, 2);
    g.lineBetween(2, 2, 2, 12);
    // Canto superior direito
    g.lineBetween(52, 2, 62, 2);
    g.lineBetween(62, 2, 62, 12);
    // Canto inferior esquerdo
    g.lineBetween(2, 52, 2, 62);
    g.lineBetween(2, 62, 12, 62);
    // Canto inferior direito
    g.lineBetween(52, 62, 62, 62);
    g.lineBetween(62, 52, 62, 62);
    // Fundo semi-transparente
    g.fillStyle(0xd4a544, 0.15);
    g.fillRect(2, 2, 60, 60);
    // Pequena cruz no centro (símbolo de construção)
    g.lineStyle(2, 0xd4a544, 0.6);
    g.lineBetween(26, 32, 38, 32);
    g.lineBetween(32, 26, 32, 38);
    g.generateTexture('buildzone', 64, 64);
    g.destroy();
  }

  // ----- Castelo (base do jogador) -----
  gerarCastelo() {
    if (this.textures.exists('castle')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Sombra
    g.fillStyle(0x000000, 0.5);
    g.fillEllipse(48, 92, 80, 12);
    // Corpo do castelo
    g.fillStyle(0x7a7a80, 1);
    g.fillRect(16, 30, 64, 60);
    g.lineStyle(2, 0x4a4a50, 1);
    g.strokeRect(16, 30, 64, 60);
    // Tijolos
    g.lineStyle(1, 0x4a4a50, 0.5);
    for (let y = 35; y < 90; y += 8) {
      g.lineBetween(16, y, 80, y);
      const offset = (y / 8) % 2 === 0 ? 0 : 8;
      for (let x = 16 + offset; x < 80; x += 16) {
        g.lineBetween(x, y, x, y + 8);
      }
    }
    // Torres laterais
    g.fillStyle(0x8a8a90, 1);
    g.fillRect(8, 16, 16, 74);
    g.fillRect(72, 16, 16, 74);
    g.lineStyle(2, 0x4a4a50, 1);
    g.strokeRect(8, 16, 16, 74);
    g.strokeRect(72, 16, 16, 74);
    // Topos cônico das torres
    g.fillStyle(0xc0392b, 1);
    g.fillTriangle(8, 16, 24, 16, 16, 2);
    g.fillTriangle(72, 16, 88, 16, 80, 2);
    g.lineStyle(1, 0x8b1f15, 1);
    g.strokeTriangle(8, 16, 24, 16, 16, 2);
    g.strokeTriangle(72, 16, 88, 16, 80, 2);
    // Bandeiras
    g.fillStyle(0x6b4423, 1);
    g.fillRect(15, 0, 2, 8);
    g.fillRect(79, 0, 2, 8);
    g.fillStyle(0xc0392b, 1);
    g.fillTriangle(17, 1, 25, 4, 17, 7);
    g.fillTriangle(81, 1, 89, 4, 81, 7);
    // Portão (madeira reforçada)
    g.fillStyle(0x3a2410, 1);
    g.fillRect(36, 60, 24, 30);
    g.fillStyle(0x6b4423, 1);
    g.fillRect(38, 62, 20, 26);
    // Vigas do portão
    g.lineStyle(1, 0x3a2410, 0.8);
    g.lineBetween(42, 62, 42, 88);
    g.lineBetween(48, 62, 48, 88);
    g.lineBetween(54, 62, 54, 88);
    // Rebites no portão
    g.fillStyle(0x9a8a7a, 1);
    g.fillCircle(40, 66, 1);
    g.fillCircle(40, 80, 1);
    g.fillCircle(56, 66, 1);
    g.fillCircle(56, 80, 1);
    // Janelas
    g.fillStyle(0x000000, 0.7);
    g.fillRect(24, 40, 6, 8);
    g.fillRect(66, 40, 6, 8);
    // Brasão acima do portão
    g.fillStyle(0xd4a544, 1);
    g.fillCircle(48, 50, 6);
    g.lineStyle(1, 0xa07820, 1);
    g.strokeCircle(48, 50, 6);
    g.fillStyle(0xc0392b, 1);
    g.fillRect(46, 46, 4, 8);
    g.fillRect(43, 49, 10, 2);
    g.generateTexture('castle', 96, 96);
    g.destroy();
  }

  // ============================================================
  // TEXTURAS DE UI (mantém as que já tínhamos + ajustes)
  // ============================================================
  gerarTexturasUI() {
    this.gerarTexturaMadeira();
    this.gerarTexturaPergaminho();
    this.gerarBotaoMadeira();
    this.gerarBotaoMadeiraPequeno();
    this.gerarPainelMadeira();
    this.gerarPainelPergaminho();
    this.gerarIcones();
    this.gerarDecoracoes();
  }

  gerarTexturaMadeira() {
    if (this.textures.exists('tex_madeira')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x6b4423, 1);
    g.fillRect(0, 0, 256, 64);
    for (let y = 0; y < 64; y += 4) {
      const intensity = Math.sin(y * 0.3) * 0.3 + 0.7;
      const r = Math.floor(107 * intensity);
      const gr = Math.floor(68 * intensity);
      const b = Math.floor(35 * intensity);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 0.6);
      g.fillRect(0, y, 256, 2);
    }
    g.fillStyle(0x3a2410, 0.8);
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 50 + Math.random() * 20;
      const y = 10 + Math.random() * 44;
      g.fillEllipse(x, y, 8, 14);
    }
    g.fillStyle(0x2a1808, 1);
    g.fillRect(0, 0, 256, 2);
    g.fillRect(0, 62, 256, 2);
    g.generateTexture('tex_madeira', 256, 64);
    g.destroy();
  }

  gerarTexturaPergaminho() {
    if (this.textures.exists('tex_pergaminho')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xe8d5a8, 1);
    g.fillRect(0, 0, 256, 256);
    g.fillStyle(0xc4a877, 0.4);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 3 + Math.random() * 15;
      g.fillCircle(x, y, r);
    }
    g.fillStyle(0xa08855, 0.3);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 12);
    }
    g.fillStyle(0x8a7050, 0.2);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillRect(x, y, 1, 4 + Math.random() * 8);
    }
    g.fillStyle(0x8a6a40, 0.6);
    g.fillRect(0, 0, 256, 4);
    g.fillRect(0, 252, 256, 4);
    g.fillRect(0, 0, 4, 256);
    g.fillRect(252, 0, 4, 256);
    g.generateTexture('tex_pergaminho', 256, 256);
    g.destroy();
  }

  gerarBotaoMadeira() {
    if (this.textures.exists('btn_madeira')) return;
    const W = 380, H = 56;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(4, 6, W - 4, H - 4, 8);
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 4, W - 4, H - 8, 8);
    g.fillStyle(0x6b4423, 1);
    g.fillRoundedRect(5, 7, W - 10, H - 14, 6);
    for (let y = 10; y < H - 8; y += 3) {
      g.fillStyle(0x553318, 0.5);
      g.fillRect(8, y, W - 16, 1);
    }
    g.lineStyle(2, 0x2a1808, 0.8);
    g.strokeRoundedRect(5, 7, W - 10, H - 14, 6);
    g.fillStyle(0xd4a544, 1);
    g.fillCircle(15, 17, 3);
    g.fillCircle(W - 15, 17, 3);
    g.fillCircle(15, H - 17, 3);
    g.fillCircle(W - 15, H - 17, 3);
    g.fillStyle(0xfff0a0, 0.8);
    g.fillCircle(14, 16, 1);
    g.fillCircle(W - 16, 16, 1);
    g.generateTexture('btn_madeira', W, H);
    g.destroy();
  }

  gerarBotaoMadeiraPequeno() {
    if (this.textures.exists('btn_madeira_peq')) return;
    const W = 220, H = 44;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(3, 5, W - 3, H - 3, 6);
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 3, W - 4, H - 6, 6);
    g.fillStyle(0x5a3818, 1);
    g.fillRoundedRect(4, 5, W - 8, H - 10, 5);
    for (let y = 8; y < H - 6; y += 3) {
      g.fillStyle(0x402810, 0.5);
      g.fillRect(7, y, W - 14, 1);
    }
    g.lineStyle(1, 0x2a1808, 0.8);
    g.strokeRoundedRect(4, 5, W - 8, H - 10, 5);
    g.generateTexture('btn_madeira_peq', W, H);
    g.destroy();
  }

  gerarPainelMadeira() {
    if (this.textures.exists('painel_madeira')) return;
    const W = 600, H = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.6);
    g.fillRoundedRect(4, 5, W - 4, H - 4, 10);
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 3, W - 4, H - 6, 10);
    g.fillStyle(0x4a2e15, 1);
    g.fillRoundedRect(6, 7, W - 12, H - 14, 8);
    for (let y = 10; y < H - 8; y += 4) {
      g.fillStyle(0x3a2410, 0.6);
      g.fillRect(10, y, W - 20, 2);
    }
    g.lineStyle(2, 0x2a1808, 1);
    g.strokeRoundedRect(6, 7, W - 12, H - 14, 8);
    g.fillStyle(0xd4a544, 1);
    [[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].forEach(([x, y]) => {
      g.fillCircle(x, y, 4);
      g.fillStyle(0xfff0a0, 0.8);
      g.fillCircle(x - 1, y - 1, 1.5);
      g.fillStyle(0xd4a544, 1);
    });
    g.generateTexture('painel_madeira', W, H);
    g.destroy();
  }

  gerarPainelPergaminho() {
    if (this.textures.exists('painel_pergaminho')) return;
    const W = 500, H = 400;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(6, 8, W, H, 12);
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(3, 5, W, H, 12);
    g.fillStyle(0xe8d5a8, 1);
    g.fillRoundedRect(8, 10, W - 10, H - 10, 10);
    g.fillStyle(0xc4a877, 0.4);
    for (let i = 0; i < 40; i++) {
      g.fillCircle(15 + Math.random() * (W - 30), 15 + Math.random() * (H - 30), 3 + Math.random() * 12);
    }
    g.lineStyle(2, 0x8a6a40, 0.7);
    g.strokeRoundedRect(12, 14, W - 18, H - 18, 8);
    g.fillStyle(0xd4a544, 1);
    [[20, 22], [W - 10, 22], [20, H - 12], [W - 10, H - 12]].forEach(([x, y]) => {
      g.fillCircle(x, y, 5);
      g.fillStyle(0xfff0a0, 0.8);
      g.fillCircle(x - 1, y - 1, 2);
      g.fillStyle(0xd4a544, 1);
    });
    g.generateTexture('painel_pergaminho', W + 10, H + 15);
    g.destroy();
  }

  gerarIcones() {
    // Espada
    if (!this.textures.exists('icon_espada')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6b4423, 1);
      g.fillRect(11, 20, 4, 8);
      g.fillStyle(0xd4a544, 1);
      g.fillRect(7, 18, 12, 3);
      g.fillStyle(0xe0e0e0, 1);
      g.fillTriangle(13, 4, 8, 18, 18, 18);
      g.fillStyle(0xffffff, 0.8);
      g.fillTriangle(13, 6, 11, 16, 15, 16);
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(13, 30, 2);
      g.generateTexture('icon_espada', 26, 34);
      g.destroy();
    }
    // Escudo
    if (!this.textures.exists('icon_escudo')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x8b4513, 1);
      g.fillEllipse(16, 16, 24, 28);
      g.lineStyle(2, 0xd4a544, 1);
      g.strokeEllipse(16, 16, 24, 28);
      g.fillStyle(0xd4a544, 1);
      g.fillRect(14, 8, 4, 16);
      g.fillRect(8, 14, 16, 4);
      g.generateTexture('icon_escudo', 32, 32);
      g.destroy();
    }
    // Troféu
    if (!this.textures.exists('icon_trofeu')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      g.fillEllipse(16, 12, 18, 14);
      g.fillRect(12, 12, 8, 8);
      g.fillRect(7, 11, 4, 4);
      g.fillRect(21, 11, 4, 4);
      g.fillRect(10, 20, 12, 3);
      g.fillRect(8, 23, 16, 4);
      g.fillStyle(0xfff0a0, 0.9);
      g.fillRect(13, 8, 3, 6);
      g.generateTexture('icon_trofeu', 32, 32);
      g.destroy();
    }
    // Coroa
    if (!this.textures.exists('icon_coroa')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      g.fillRect(6, 16, 20, 8);
      g.fillTriangle(6, 16, 11, 16, 8, 6);
      g.fillTriangle(11, 16, 21, 16, 16, 4);
      g.fillTriangle(21, 16, 26, 16, 24, 6);
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(8, 6, 2);
      g.fillCircle(24, 6, 2);
      g.fillStyle(0x3498db, 1);
      g.fillCircle(16, 4, 2.5);
      g.fillStyle(0xa07820, 1);
      g.fillRect(6, 22, 20, 2);
      g.generateTexture('icon_coroa', 32, 28);
      g.destroy();
    }
    // Pergaminho
    if (!this.textures.exists('icon_pergaminho')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe8d5a8, 1);
      g.fillRect(8, 8, 16, 16);
      g.lineStyle(1, 0x8a6a40, 1);
      g.strokeRect(8, 8, 16, 16);
      g.fillStyle(0x5a3a20, 1);
      g.fillRect(10, 11, 12, 1);
      g.fillRect(10, 14, 12, 1);
      g.fillRect(10, 17, 10, 1);
      g.fillRect(10, 20, 8, 1);
      g.fillStyle(0xa08555, 1);
      g.fillEllipse(8, 16, 4, 18);
      g.fillEllipse(24, 16, 4, 18);
      g.generateTexture('icon_pergaminho', 32, 32);
      g.destroy();
    }
    // Caveira
    if (!this.textures.exists('icon_caveira')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xeeeedd, 1);
      g.fillCircle(16, 13, 10);
      g.fillRect(10, 18, 12, 8);
      g.fillStyle(0x000000, 1);
      g.fillCircle(12, 12, 2.5);
      g.fillCircle(20, 12, 2.5);
      g.fillTriangle(15, 16, 17, 16, 16, 18);
      g.fillStyle(0x000000, 0.6);
      g.fillRect(12, 22, 1, 4);
      g.fillRect(15, 22, 1, 4);
      g.fillRect(18, 22, 1, 4);
      g.generateTexture('icon_caveira', 32, 32);
      g.destroy();
    }
    // Moeda
    if (!this.textures.exists('icon_moeda')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(16, 16, 12);
      g.lineStyle(2, 0xa07820, 1);
      g.strokeCircle(16, 16, 9);
      g.fillStyle(0xa07820, 1);
      g.fillRect(14, 10, 4, 12);
      g.fillRect(11, 13, 10, 2);
      g.fillRect(11, 17, 10, 2);
      g.fillStyle(0xfff0a0, 0.8);
      g.fillCircle(11, 11, 3);
      g.generateTexture('icon_moeda', 32, 32);
      g.destroy();
    }
    // Relógio
    if (!this.textures.exists('icon_relogio')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe8d5a8, 1);
      g.fillTriangle(8, 6, 24, 6, 16, 14);
      g.fillTriangle(8, 26, 24, 26, 16, 18);
      g.fillStyle(0x6b4423, 1);
      g.fillRect(6, 4, 20, 3);
      g.fillRect(6, 25, 20, 3);
      g.fillRect(14, 6, 4, 20);
      g.fillStyle(0xd4a544, 1);
      g.fillTriangle(10, 8, 22, 8, 16, 12);
      g.fillTriangle(13, 24, 19, 24, 16, 20);
      g.generateTexture('icon_relogio', 32, 32);
      g.destroy();
    }
    // Estrela
    if (!this.textures.exists('icon_estrela')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      const points = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? 14 : 6;
        points.push(16 + Math.cos(angle) * r);
        points.push(16 + Math.sin(angle) * r);
      }
      g.fillPoints(points, true);
      g.fillStyle(0xfff0a0, 0.9);
      g.fillCircle(13, 13, 3);
      g.generateTexture('icon_estrela', 32, 32);
      g.destroy();
    }
    // Martelo (construção)
    if (!this.textures.exists('icon_martelo')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Cabo
      g.fillStyle(0x6b4423, 1);
      g.fillRect(14, 12, 4, 18);
      // Cabeça do martelo
      g.fillStyle(0x9a8a7a, 1);
      g.fillRect(8, 4, 16, 10);
      g.lineStyle(1, 0x4a3a2a, 1);
      g.strokeRect(8, 4, 16, 10);
      // Highlight
      g.fillStyle(0xc0b0a0, 0.6);
      g.fillRect(9, 5, 14, 2);
      g.generateTexture('icon_martelo', 32, 32);
      g.destroy();
    }
  }

  gerarDecoracoes() {
    if (!this.textures.exists('decor_bandeira')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6b4423, 1);
      g.fillRect(8, 0, 3, 80);
      g.fillStyle(0xc0392b, 1);
      g.fillTriangle(11, 5, 50, 15, 11, 35);
      g.fillStyle(0x8b1f15, 0.5);
      g.fillTriangle(11, 25, 50, 15, 11, 35);
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(20, 17, 4);
      g.generateTexture('decor_bandeira', 60, 80);
      g.destroy();
    }
    if (!this.textures.exists('decor_brasao')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.5);
      g.fillEllipse(52, 52, 80, 100);
      g.fillStyle(0xd4a544, 1);
      g.fillEllipse(50, 50, 80, 100);
      g.fillStyle(0x4a2e15, 1);
      g.fillEllipse(50, 50, 70, 90);
      g.fillStyle(0xd4a544, 1);
      g.fillRect(45, 15, 10, 70);
      g.fillRect(20, 40, 60, 10);
      g.fillStyle(0xfff0a0, 1);
      g.fillCircle(50, 15, 3);
      g.fillCircle(50, 85, 3);
      g.fillCircle(20, 50, 3);
      g.fillCircle(80, 50, 3);
      g.generateTexture('decor_brasao', 100, 110);
      g.destroy();
    }
    if (!this.textures.exists('decor_castelo')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(100, 95, 180, 20);
      g.fillStyle(0x5a5a5f, 1);
      g.fillRect(40, 40, 120, 50);
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(20, 20, 30, 70);
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(150, 20, 30, 70);
      g.fillStyle(0x7a7a7f, 1);
      g.fillRect(85, 5, 30, 85);
      g.fillStyle(0x4a4a4f, 1);
      for (let x = 20; x < 50; x += 8) g.fillRect(x, 14, 5, 8);
      for (let x = 150; x < 180; x += 8) g.fillRect(x, 14, 5, 8);
      for (let x = 85; x < 115; x += 8) g.fillRect(x, 0, 5, 8);
      for (let x = 40; x < 160; x += 10) g.fillRect(x, 34, 6, 8);
      g.fillStyle(0x2a1808, 1);
      g.fillEllipse(100, 80, 16, 25);
      g.fillStyle(0x6b4423, 1);
      g.fillRect(93, 70, 14, 20);
      g.fillStyle(0x000000, 0.7);
      g.fillRect(28, 30, 5, 8);
      g.fillRect(35, 30, 5, 8);
      g.fillRect(160, 30, 5, 8);
      g.fillRect(167, 30, 5, 8);
      g.fillRect(95, 20, 4, 8);
      g.fillRect(102, 20, 4, 8);
      g.fillStyle(0x6b4423, 1);
      g.fillRect(99, -5, 2, 15);
      g.fillStyle(0xc0392b, 1);
      g.fillTriangle(101, -3, 115, 2, 101, 8);
      g.generateTexture('decor_castelo', 200, 100);
      g.destroy();
    }
  }
}
