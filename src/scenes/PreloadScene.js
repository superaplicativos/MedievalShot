// ============================================================
// Medieval Kingshot - PreloadScene
// ============================================================
// Carrega as imagens reais de /public/assets/.
// IMPORTANTE: remove os placeholders do BootScene antes de
// carregar para garantir que os sprites reais sejam usados.
// ============================================================

import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // --------------------------------------------------------
    // Remove placeholders do BootScene para que as imagens reais
    // sejam carregadas corretamente (Phaser não sobrescreve texturas existentes)
    // --------------------------------------------------------
    const texturasParaRemover = [
      'tower',
      'enemy_goblin',
      'enemy_ogre',
      'enemy_armored_ogre',
      'arrow',
    ];
    texturasParaRemover.forEach((nome) => {
      if (this.textures.exists(nome)) {
        this.textures.remove(nome);
      }
    });

    // --------------------------------------------------------
    // Barra de carregamento visual
    // --------------------------------------------------------
    const largura = this.scale.width;
    const altura = this.scale.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(largura / 2 - 160, altura / 2 - 25, 320, 50);

    const textoCarregando = this.add
      .text(largura / 2, altura / 2 - 50, 'Carregando reino...', {
        fontFamily: 'Cinzel, serif',
        fontSize: '18px',
        color: '#d4a544',
      })
      .setOrigin(0.5);

    const textoPercent = this.add
      .text(largura / 2, altura / 2, '0%', {
        fontFamily: 'Cinzel, serif',
        fontSize: '16px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.load.on('progress', (valor) => {
      progressBar.clear();
      progressBar.fillStyle(0xd4a544, 1);
      progressBar.fillRect(largura / 2 - 156, altura / 2 - 21, 312 * valor, 42);
      textoPercent.setText(`${Math.floor(valor * 100)}%`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      textoCarregando.destroy();
      textoPercent.destroy();
    });

    // --------------------------------------------------------
    // Carrega imagens reais
    // --------------------------------------------------------
    this.load.image('tower', 'assets/tower.png');
    this.load.image('enemy_goblin', 'assets/enemy_goblin.png');
    this.load.image('enemy_ogre', 'assets/enemy_ogre.png');
    this.load.image('enemy_armored_ogre', 'assets/enemy_armored_ogre.png');
    this.load.image('arrow', 'assets/arrow.png');

    // Tratamento de erro: se uma imagem falhar, recria um placeholder simples
    this.load.on('loaderror', (file) => {
      console.warn('[PreloadScene] Erro ao carregar:', file.key);
      // Recria placeholder básico para não quebrar o jogo
      this.criarPlaceholderSimples(file.key);
    });
  }

  create() {
    console.log('[PreloadScene] Assets carregados.');
    // Verifica se as imagens reais foram carregadas
    ['tower', 'enemy_goblin', 'enemy_ogre', 'enemy_armored_ogre', 'arrow'].forEach((nome) => {
      if (this.textures.exists(nome)) {
        const tex = this.textures.get(nome);
        console.log(`  ✓ ${nome}: ${tex.source[0].width}x${tex.source[0].height}`);
      } else {
        console.warn(`  ✗ ${nome}: não carregou`);
      }
    });

    this.scene.start('MenuScene');
  }

  /**
   * Cria um placeholder simples caso a imagem real falhe ao carregar.
   */
  criarPlaceholderSimples(nome) {
    if (this.textures.exists(nome)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    let cor = 0xff00ff; // magenta para indicar erro
    let tamanho = 32;
    switch (nome) {
      case 'tower':
        cor = 0x6b6b6b;
        tamanho = 128;
        break;
      case 'enemy_goblin':
        cor = 0x88cc44;
        tamanho = 64;
        break;
      case 'enemy_ogre':
        cor = 0x5a8a3a;
        tamanho = 96;
        break;
      case 'enemy_armored_ogre':
        cor = 0x9a8a7a;
        tamanho = 96;
        break;
      case 'arrow':
        cor = 0xd4a544;
        tamanho = 32;
        break;
    }
    g.fillStyle(cor, 1);
    g.fillCircle(tamanho / 2, tamanho / 2, tamanho / 2 - 2);
    g.lineStyle(2, 0x000000, 1);
    g.strokeCircle(tamanho / 2, tamanho / 2, tamanho / 2 - 2);
    g.generateTexture(nome, tamanho, tamanho);
    g.destroy();
  }
}
