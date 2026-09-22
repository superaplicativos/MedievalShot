// ============================================================
// Medieval Kingshot - BootScene
// ============================================================
// Gera TODAS as texturas procedurais usadas no jogo:
//   - Sprites do jogo (torre, inimigos, flecha)
//   - Texturas de UI (madeira, pergaminho, pedra, ouro)
//   - Botões medievais (com bordas e profundidade)
//   - Ícones temáticos (espadas, escudos, troféus)
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
  // SPRITES DO JOGO (placeholders caso as PNGs reais falhem)
  // ============================================================
  gerarTexturasJogo() {
    // Torre
    if (!this.textures.exists('tower')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x6b6b6b, 1);
      g.fillRect(20, 30, 88, 80);
      g.fillStyle(0xd4a544, 1);
      g.fillRect(35, 10, 58, 30);
      g.generateTexture('tower', 128, 128);
      g.destroy();
    }

    if (!this.textures.exists('enemy_goblin')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x88cc44, 1);
      g.fillCircle(32, 32, 22);
      g.generateTexture('enemy_goblin', 64, 64);
      g.destroy();
    }

    if (!this.textures.exists('enemy_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x5a8a3a, 1);
      g.fillCircle(48, 48, 36);
      g.generateTexture('enemy_ogre', 96, 96);
      g.destroy();
    }

    if (!this.textures.exists('enemy_armored_ogre')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x9a8a7a, 1);
      g.fillCircle(48, 48, 36);
      g.generateTexture('enemy_armored_ogre', 96, 96);
      g.destroy();
    }

    if (!this.textures.exists('arrow')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x3a2a1a, 1);
      g.fillRect(7, 8, 4, 14);
      g.fillStyle(0xcccccc, 1);
      g.fillTriangle(9, 2, 5, 8, 13, 8);
      g.generateTexture('arrow', 18, 30);
      g.destroy();
    }
  }

  // ============================================================
  // TEXTURAS DE UI MEDIEVAL
  // ============================================================
  gerarTexturasUI() {
    this.gerarTexturaMadeira();
    this.gerarTexturaPergaminho();
    this.gerarTexturaPedra();
    this.gerarTexturaOuro();
    this.gerarBotaoMadeira();
    this.gerarBotaoMadeiraPequeno();
    this.gerarPainelMadeira();
    this.gerarPainelPergaminho();
    this.gerarIcones();
    this.gerarDecoracoes();
  }

  // ----- Textura base: madeira envelhecida -----
  gerarTexturaMadeira() {
    if (this.textures.exists('tex_madeira')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Fundo marrom
    g.fillStyle(0x6b4423, 1);
    g.fillRect(0, 0, 256, 64);

    // Veios da madeira (linhas horizontais escuras e claras)
    for (let y = 0; y < 64; y += 4) {
      const intensity = Math.sin(y * 0.3) * 0.3 + 0.7;
      const r = Math.floor(107 * intensity);
      const gr = Math.floor(68 * intensity);
      const b = Math.floor(35 * intensity);
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 0.6);
      g.fillRect(0, y, 256, 2);
    }

    // Nós da madeira (pontos escuros aleatórios)
    g.fillStyle(0x3a2410, 0.8);
    for (let i = 0; i < 5; i++) {
      const x = 30 + i * 50 + Math.random() * 20;
      const y = 10 + Math.random() * 44;
      g.fillEllipse(x, y, 8, 14);
    }

    // Bordas escuras
    g.fillStyle(0x2a1808, 1);
    g.fillRect(0, 0, 256, 2);
    g.fillRect(0, 62, 256, 2);

    g.generateTexture('tex_madeira', 256, 64);
    g.destroy();
  }

  // ----- Textura base: pergaminho antigo -----
  gerarTexturaPergaminho() {
    if (this.textures.exists('tex_pergaminho')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Fundo bege amarelado
    g.fillStyle(0xe8d5a8, 1);
    g.fillRect(0, 0, 256, 256);

    // Manchas de envelhecimento
    g.fillStyle(0xc4a877, 0.4);
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const r = 3 + Math.random() * 15;
      g.fillCircle(x, y, r);
    }

    // Manchas mais escuras (bordas queimadas)
    g.fillStyle(0xa08855, 0.3);
    for (let i = 0; i < 8; i++) {
      g.fillCircle(Math.random() * 256, Math.random() * 256, 8 + Math.random() * 12);
    }

    // Pequenos fios/fibras
    g.fillStyle(0x8a7050, 0.2);
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      g.fillRect(x, y, 1, 4 + Math.random() * 8);
    }

    // Borda envelhecida
    g.fillStyle(0x8a6a40, 0.6);
    g.fillRect(0, 0, 256, 4);
    g.fillRect(0, 252, 256, 4);
    g.fillRect(0, 0, 4, 256);
    g.fillRect(252, 0, 4, 256);

    g.generateTexture('tex_pergaminho', 256, 256);
    g.destroy();
  }

  // ----- Textura base: pedra -----
  gerarTexturaPedra() {
    if (this.textures.exists('tex_pedra')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x5a5a5f, 1);
    g.fillRect(0, 0, 256, 256);

    // Blocos de pedra
    for (let y = 0; y < 256; y += 32) {
      const offset = (y / 32) % 2 === 0 ? 0 : 16;
      for (let x = -16; x < 256; x += 32) {
        const r = 80 + Math.random() * 40;
        const gr = 80 + Math.random() * 40;
        const b = 85 + Math.random() * 40;
        g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 1);
        g.fillRect(x + offset, y, 30, 30);
        // Sombra entre blocos
        g.fillStyle(0x000000, 0.4);
        g.fillRect(x + offset + 28, y, 2, 30);
        g.fillRect(x + offset, y + 28, 30, 2);
      }
    }

    g.generateTexture('tex_pedra', 256, 256);
    g.destroy();
  }

  // ----- Textura base: ouro metálico -----
  gerarTexturaOuro() {
    if (this.textures.exists('tex_ouro')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Gradiente dourado
    for (let y = 0; y < 64; y++) {
      const t = y / 64;
      const r = Math.floor(180 + (255 - 180) * (1 - Math.abs(t - 0.5) * 2));
      const gr = Math.floor(140 + (200 - 140) * (1 - Math.abs(t - 0.5) * 2));
      const b = Math.floor(40 + (60 - 40) * (1 - Math.abs(t - 0.5) * 2));
      g.fillStyle(Phaser.Display.Color.GetColor(r, gr, b), 1);
      g.fillRect(0, y, 256, 1);
    }

    // Brilhos
    g.fillStyle(0xffffff, 0.3);
    for (let i = 0; i < 5; i++) {
      g.fillRect(Math.random() * 256, 10 + Math.random() * 44, 20 + Math.random() * 30, 2);
    }

    g.generateTexture('tex_ouro', 256, 64);
    g.destroy();
  }

  // ----- Botão de madeira grande (com bordas ornamentadas) -----
  gerarBotaoMadeira() {
    if (this.textures.exists('btn_madeira')) return;
    const W = 380, H = 56;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sombra externa
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(4, 6, W - 4, H - 4, 8);

    // Borda dourada
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 4, W - 4, H - 8, 8);

    // Interior de madeira
    g.fillStyle(0x6b4423, 1);
    g.fillRoundedRect(5, 7, W - 10, H - 14, 6);

    // Veios da madeira
    for (let y = 10; y < H - 8; y += 3) {
      g.fillStyle(0x553318, 0.5);
      g.fillRect(8, y, W - 16, 1);
    }

    // Borda interna escura
    g.lineStyle(2, 0x2a1808, 0.8);
    g.strokeRoundedRect(5, 7, W - 10, H - 14, 6);

    // Cantos dourados decorativos (4 rivets)
    g.fillStyle(0xd4a544, 1);
    g.fillCircle(15, 17, 3);
    g.fillCircle(W - 15, 17, 3);
    g.fillCircle(15, H - 17, 3);
    g.fillCircle(W - 15, H - 17, 3);
    // Highlight nos rivets
    g.fillStyle(0xfff0a0, 0.8);
    g.fillCircle(14, 16, 1);
    g.fillCircle(W - 16, 16, 1);

    g.generateTexture('btn_madeira', W, H);
    g.destroy();
  }

  // ----- Botão de madeira pequeno -----
  gerarBotaoMadeiraPequeno() {
    if (this.textures.exists('btn_madeira_peq')) return;
    const W = 220, H = 44;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sombra
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(3, 5, W - 3, H - 3, 6);

    // Borda
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 3, W - 4, H - 6, 6);

    // Madeira
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

  // ----- Painel de madeira (fundo para HUD/menus) -----
  gerarPainelMadeira() {
    if (this.textures.exists('painel_madeira')) return;
    const W = 600, H = 80;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sombra
    g.fillStyle(0x000000, 0.6);
    g.fillRoundedRect(4, 5, W - 4, H - 4, 10);

    // Borda dourada externa
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(2, 3, W - 4, H - 6, 10);

    // Interior madeira
    g.fillStyle(0x4a2e15, 1);
    g.fillRoundedRect(6, 7, W - 12, H - 14, 8);

    // Veios
    for (let y = 10; y < H - 8; y += 4) {
      g.fillStyle(0x3a2410, 0.6);
      g.fillRect(10, y, W - 20, 2);
    }

    // Bordas internas
    g.lineStyle(2, 0x2a1808, 1);
    g.strokeRoundedRect(6, 7, W - 12, H - 14, 8);

    // Rivets nos cantos
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

  // ----- Painel de pergaminho -----
  gerarPainelPergaminho() {
    if (this.textures.exists('painel_pergaminho')) return;
    const W = 500, H = 400;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Sombra
    g.fillStyle(0x000000, 0.5);
    g.fillRoundedRect(6, 8, W, H, 12);

    // Borda dourada
    g.fillStyle(0xd4a544, 1);
    g.fillRoundedRect(3, 5, W, H, 12);

    // Pergaminho
    g.fillStyle(0xe8d5a8, 1);
    g.fillRoundedRect(8, 10, W - 10, H - 10, 10);

    // Manchas
    g.fillStyle(0xc4a877, 0.4);
    for (let i = 0; i < 40; i++) {
      g.fillCircle(15 + Math.random() * (W - 30), 15 + Math.random() * (H - 30), 3 + Math.random() * 12);
    }

    // Borda interna envelhecida
    g.lineStyle(2, 0x8a6a40, 0.7);
    g.strokeRoundedRect(12, 14, W - 18, H - 18, 8);

    // Ornamentos nos cantos
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

  // ============================================================
  // ÍCONES TEMÁTICOS (substituem emojis)
  // ============================================================
  gerarIcones() {
    // ----- Espada (ícone de ataque/jogar) -----
    if (!this.textures.exists('icon_espada')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Cabo
      g.fillStyle(0x6b4423, 1);
      g.fillRect(11, 20, 4, 8);
      // Guarda
      g.fillStyle(0xd4a544, 1);
      g.fillRect(7, 18, 12, 3);
      // Lâmina
      g.fillStyle(0xe0e0e0, 1);
      g.fillTriangle(13, 4, 8, 18, 18, 18);
      // Highlight lâmina
      g.fillStyle(0xffffff, 0.8);
      g.fillTriangle(13, 6, 11, 16, 15, 16);
      // Pomo
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(13, 30, 2);
      g.generateTexture('icon_espada', 26, 34);
      g.destroy();
    }

    // ----- Escudo (ícone de defesa/fase) -----
    if (!this.textures.exists('icon_escudo')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Escudo
      g.fillStyle(0x8b4513, 1);
      g.fillEllipse(16, 16, 24, 28);
      // Borda
      g.fillStyle(0xd4a544, 1);
      g.lineStyle(2, 0xd4a544, 1);
      g.strokeEllipse(16, 16, 24, 28);
      // Cruz no centro
      g.fillStyle(0xd4a544, 1);
      g.fillRect(14, 8, 4, 16);
      g.fillRect(8, 14, 16, 4);
      g.generateTexture('icon_escudo', 32, 32);
      g.destroy();
    }

    // ----- Troféu (ícone de ranking) -----
    if (!this.textures.exists('icon_trofeu')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Taça
      g.fillStyle(0xd4a544, 1);
      g.fillEllipse(16, 12, 18, 14);
      // Base da taça
      g.fillRect(12, 12, 8, 8);
      // Pegador
      g.fillRect(7, 11, 4, 4);
      g.fillRect(21, 11, 4, 4);
      // Pé
      g.fillRect(10, 20, 12, 3);
      g.fillRect(8, 23, 16, 4);
      // Highlight
      g.fillStyle(0xfff0a0, 0.9);
      g.fillRect(13, 8, 3, 6);
      g.generateTexture('icon_trofeu', 32, 32);
      g.destroy();
    }

    // ----- Coroa (ícone de nickname/perfil) -----
    if (!this.textures.exists('icon_coroa')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      // Base da coroa
      g.fillRect(6, 16, 20, 8);
      // Pontas
      g.fillTriangle(6, 16, 11, 16, 8, 6);
      g.fillTriangle(11, 16, 21, 16, 16, 4);
      g.fillTriangle(21, 16, 26, 16, 24, 6);
      // Joias
      g.fillStyle(0xe74c3c, 1);
      g.fillCircle(8, 6, 2);
      g.fillCircle(24, 6, 2);
      g.fillStyle(0x3498db, 1);
      g.fillCircle(16, 4, 2.5);
      // Detalhes base
      g.fillStyle(0xa07820, 1);
      g.fillRect(6, 22, 20, 2);
      g.generateTexture('icon_coroa', 32, 28);
      g.destroy();
    }

    // ----- Pergaminho (ícone de ajuda) -----
    if (!this.textures.exists('icon_pergaminho')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe8d5a8, 1);
      g.fillRect(8, 8, 16, 16);
      g.lineStyle(1, 0x8a6a40, 1);
      g.strokeRect(8, 8, 16, 16);
      // Linhas de texto
      g.fillStyle(0x5a3a20, 1);
      g.fillRect(10, 11, 12, 1);
      g.fillRect(10, 14, 12, 1);
      g.fillRect(10, 17, 10, 1);
      g.fillRect(10, 20, 8, 1);
      // Bordas enroladas
      g.fillStyle(0xa08555, 1);
      g.fillEllipse(8, 16, 4, 18);
      g.fillEllipse(24, 16, 4, 18);
      g.generateTexture('icon_pergaminho', 32, 32);
      g.destroy();
    }

    // ----- Caveira (ícone de kills) -----
    if (!this.textures.exists('icon_caveira')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xeeeedd, 1);
      // Crânio
      g.fillCircle(16, 13, 10);
      // Mandíbula
      g.fillRect(10, 18, 12, 8);
      // Olhos
      g.fillStyle(0x000000, 1);
      g.fillCircle(12, 12, 2.5);
      g.fillCircle(20, 12, 2.5);
      // Nariz
      g.fillTriangle(15, 16, 17, 16, 16, 18);
      // Dentes
      g.fillStyle(0x000000, 0.6);
      g.fillRect(12, 22, 1, 4);
      g.fillRect(15, 22, 1, 4);
      g.fillRect(18, 22, 1, 4);
      g.generateTexture('icon_caveira', 32, 32);
      g.destroy();
    }

    // ----- Moeda (ícone de moedas) -----
    if (!this.textures.exists('icon_moeda')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(16, 16, 12);
      // Borda interna
      g.lineStyle(2, 0xa07820, 1);
      g.strokeCircle(16, 16, 9);
      // Símbolo
      g.fillStyle(0xa07820, 1);
      g.fillRect(14, 10, 4, 12);
      g.fillRect(11, 13, 10, 2);
      g.fillRect(11, 17, 10, 2);
      // Highlight
      g.fillStyle(0xfff0a0, 0.8);
      g.fillCircle(11, 11, 3);
      g.generateTexture('icon_moeda', 32, 32);
      g.destroy();
    }

    // ----- Relógio de areia (ícone de tempo) -----
    if (!this.textures.exists('icon_relogio')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe8d5a8, 1);
      // Topo
      g.fillTriangle(8, 6, 24, 6, 16, 14);
      // Base
      g.fillTriangle(8, 26, 24, 26, 16, 18);
      // Bordas
      g.fillStyle(0x6b4423, 1);
      g.fillRect(6, 4, 20, 3);
      g.fillRect(6, 25, 20, 3);
      g.fillRect(14, 6, 4, 20);
      // Areia
      g.fillStyle(0xd4a544, 1);
      g.fillTriangle(10, 8, 22, 8, 16, 12);
      g.fillTriangle(13, 24, 19, 24, 16, 20);
      g.generateTexture('icon_relogio', 32, 32);
      g.destroy();
    }

    // ----- Estrela (ícone de score) -----
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
      // Highlight
      g.fillStyle(0xfff0a0, 0.9);
      g.fillCircle(13, 13, 3);
      g.generateTexture('icon_estrela', 32, 32);
      g.destroy();
    }
  }

  // ============================================================
  // DECORAÇÕES (bandeiras, brasões)
  // ============================================================
  gerarDecoracoes() {
    // ----- Bandeira medieval (para decoração de menu) -----
    if (!this.textures.exists('decor_bandeira')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Haste
      g.fillStyle(0x6b4423, 1);
      g.fillRect(8, 0, 3, 80);
      // Bandeira (formato pontiagudo)
      g.fillStyle(0xc0392b, 1);
      g.fillTriangle(11, 5, 50, 15, 11, 35);
      // Sombra
      g.fillStyle(0x8b1f15, 0.5);
      g.fillTriangle(11, 25, 50, 15, 11, 35);
      // Emblema (leão estilizado)
      g.fillStyle(0xd4a544, 1);
      g.fillCircle(20, 17, 4);
      g.generateTexture('decor_bandeira', 60, 80);
      g.destroy();
    }

    // ----- Brasão decorativo -----
    if (!this.textures.exists('decor_brasao')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra
      g.fillStyle(0x000000, 0.5);
      g.fillEllipse(52, 52, 80, 100);
      // Borda dourada
      g.fillStyle(0xd4a544, 1);
      g.fillEllipse(50, 50, 80, 100);
      // Interior
      g.fillStyle(0x4a2e15, 1);
      g.fillEllipse(50, 50, 70, 90);
      // Cruz central
      g.fillStyle(0xd4a544, 1);
      g.fillRect(45, 15, 10, 70);
      g.fillRect(20, 40, 60, 10);
      // Rivets
      g.fillStyle(0xfff0a0, 1);
      g.fillCircle(50, 15, 3);
      g.fillCircle(50, 85, 3);
      g.fillCircle(20, 50, 3);
      g.fillCircle(80, 50, 3);
      g.generateTexture('decor_brasao', 100, 110);
      g.destroy();
    }

    // ----- Castelo ao fundo (decoração do menu) -----
    if (!this.textures.exists('decor_castelo')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      // Sombra base
      g.fillStyle(0x000000, 0.3);
      g.fillEllipse(100, 95, 180, 20);

      // Corpo do castelo
      g.fillStyle(0x5a5a5f, 1);
      g.fillRect(40, 40, 120, 50);

      // Torre esquerda
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(20, 20, 30, 70);

      // Torre direita
      g.fillStyle(0x6a6a6f, 1);
      g.fillRect(150, 20, 30, 70);

      // Torre central (mais alta)
      g.fillStyle(0x7a7a7f, 1);
      g.fillRect(85, 5, 30, 85);

      // Ameias
      g.fillStyle(0x4a4a4f, 1);
      // Torre esquerda
      for (let x = 20; x < 50; x += 8) g.fillRect(x, 14, 5, 8);
      // Torre direita
      for (let x = 150; x < 180; x += 8) g.fillRect(x, 14, 5, 8);
      // Torre central
      for (let x = 85; x < 115; x += 8) g.fillRect(x, 0, 5, 8);
      // Corpo
      for (let x = 40; x < 160; x += 10) g.fillRect(x, 34, 6, 8);

      // Portão
      g.fillStyle(0x2a1808, 1);
      g.fillEllipse(100, 80, 16, 25);
      g.fillStyle(0x6b4423, 1);
      g.fillRect(93, 70, 14, 20);

      // Janelas
      g.fillStyle(0x000000, 0.7);
      g.fillRect(28, 30, 5, 8);
      g.fillRect(35, 30, 5, 8);
      g.fillRect(160, 30, 5, 8);
      g.fillRect(167, 30, 5, 8);
      g.fillRect(95, 20, 4, 8);
      g.fillRect(102, 20, 4, 8);

      // Bandeira no topo
      g.fillStyle(0x6b4423, 1);
      g.fillRect(99, -5, 2, 15);
      g.fillStyle(0xc0392b, 1);
      g.fillTriangle(101, -3, 115, 2, 101, 8);

      // Highlight (lado esquerdo)
      g.fillStyle(0xffffff, 0.15);
      g.fillRect(20, 20, 4, 70);
      g.fillRect(85, 5, 3, 85);
      g.fillRect(150, 20, 3, 70);

      g.generateTexture('decor_castelo', 200, 100);
      g.destroy();
    }
  }
}
