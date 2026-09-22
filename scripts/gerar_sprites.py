#!/usr/bin/env python3
"""
============================================================
Medieval Kingshot - Gerador de Sprites PNG (v2 - alta qualidade)
============================================================
Gera as 5 imagens do jogo localmente com nível de detalhe
profissional (pixel-art rico):
  - tower.png               (128x128)
  - enemy_goblin.png        (64x64)
  - enemy_ogre.png          (96x96)
  - enemy_armored_ogre.png  (96x96)
  - arrow.png              (32x32)

Estilo: pixel-art medieval, top-down, fundo transparente.
Paleta inspirada em Age of Empires 2 + Clash Royale.
============================================================
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Paleta medieval
COR = {
    # Pedra
    "pedra_escura":    (75, 75, 80, 255),
    "pedra":           (110, 110, 115, 255),
    "pedra_clara":     (155, 155, 160, 255),
    "pedra_highlight": (190, 190, 195, 255),
    "sombra":          (40, 40, 45, 255),
    # Madeira
    "madeira":         (140, 95, 50, 255),
    "madeira_escura":  (95, 60, 30, 255),
    "madeira_clara":   (180, 130, 75, 255),
    "viga":            (60, 40, 25, 255),
    # Metal
    "ferro":           (180, 180, 190, 255),
    "ferro_escuro":    (110, 110, 120, 255),
    "ferro_claro":     (220, 220, 230, 255),
    "ferro_highlight": (245, 245, 255, 255),
    # Ouro
    "cobre":           (212, 165, 68, 255),
    "cobre_escuro":    (140, 95, 30, 255),
    "cobre_claro":     (255, 215, 100, 255),
    # Goblin
    "goblin_verde":    (120, 180, 70, 255),
    "goblin_escuro":   (75, 120, 45, 255),
    "goblin_claro":    (170, 220, 110, 255),
    # Ogro
    "ogro_verde":      (95, 130, 70, 255),
    "ogro_escuro":     (60, 85, 45, 255),
    "ogro_claro":      (140, 175, 100, 255),
    "pele_ogro":       (140, 170, 100, 255),
    # Misc
    "branco":          (245, 240, 220, 255),
    "olho_vermelho":   (220, 50, 50, 255),
    "olho_amarelo":    (220, 200, 80, 255),
    "preto":           (20, 20, 25, 255),
    "sangue":          (140, 30, 30, 255),
    "boca_escura":     (60, 20, 25, 255),
}


def nova_imagem(tamanho):
    return Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))


def sombra_chao(d, cx, cy, raio_x, raio_y, intensidade=80):
    """Desenha uma sombra elíptica no chão."""
    d.ellipse(
        [cx - raio_x, cy - raio_y, cx + raio_x, cy + raio_y],
        fill=(0, 0, 0, intensidade),
    )


def adicionar_ruido(img, intensidade=15):
    """Adiciona ruído sutil para texturizar."""
    import random
    random.seed(42)
    pixels = img.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = pixels[x, y]
            if a > 0:  # só em pixels não transparentes
                n = random.randint(-intensidade, intensidade)
                r = max(0, min(255, r + n))
                g = max(0, min(255, g + n))
                b = max(0, min(255, b + n))
                pixels[x, y] = (r, g, b, a)


# ============================================================
# 1. TORRE DE ARQUEIRO MEDIEVAL
# ============================================================
def desenhar_torre():
    img = nova_imagem(128)
    d = ImageDraw.Draw(img)

    # Sombra no chão (oval grande)
    sombra_chao(d, 64, 122, 50, 8, 90)

    # ----- Base larga de pedra -----
    # Sombra da base
    d.rectangle([20, 50, 108, 108], fill=COR["sombra"])
    # Pedra principal
    d.rectangle([22, 48, 106, 106], fill=COR["pedra"], outline=COR["pedra_escura"], width=2)

    # Textura de tijolos (pedras)
    for y in range(52, 106, 10):
        offset = 18 if (y // 10) % 2 == 0 else 9
        # Linha horizontal entre fileiras
        d.line([(22, y), (106, y)], fill=COR["pedra_escura"], width=1)
        # Linhas verticais entre tijolos
        for x in range(22 + offset, 106, 18):
            d.line([(x, y), (x, y + 9)], fill=COR["pedra_escura"], width=1)

    # Highlights na pedra (canto superior esquerdo)
    for i in range(6):
        alpha = 100 - i * 15
        overlay = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        od = ImageDraw.Draw(overlay)
        od.rectangle([22 + i, 48 + i, 106 - i * 2, 48 + i + 1], fill=(255, 255, 255, alpha))
        img = Image.alpha_composite(img, overlay)
        d = ImageDraw.Draw(img)

    # ----- Ameias no topo (4 picos) -----
    for x in [22, 40, 60, 80, 100]:
        d.rectangle([x, 36, x + 14, 50], fill=COR["pedra_clara"], outline=COR["pedra_escura"], width=2)
        # Highlight no topo da ameia
        d.rectangle([x + 1, 36, x + 13, 37], fill=COR["pedra_highlight"])

    # Parapeito atrás das ameias
    d.rectangle([22, 42, 106, 50], fill=COR["pedra"], outline=COR["pedra_escura"], width=1)

    # Plataforma de madeira no topo
    d.rectangle([26, 44, 102, 48], fill=COR["madeira"], outline=COR["madeira_escura"], width=1)
    # Veios da madeira na plataforma
    for x in range(30, 102, 8):
        d.line([(x, 44), (x, 48)], fill=COR["madeira_escura"], width=1)

    # ----- Porta de madeira -----
    # Arco da porta (pedra)
    d.rectangle([52, 80, 76, 106], fill=COR["sombra"])
    d.pieslice([50, 78, 78, 100], 180, 360, fill=COR["sombra"])
    # Porta de madeira
    d.rectangle([54, 84, 74, 106], fill=COR["madeira_escura"], outline=COR["viga"], width=1)
    d.pieslice([52, 80, 76, 100], 180, 360, fill=COR["madeira_escura"])
    # Vigas verticais
    d.line([(60, 84), (60, 106)], fill=COR["viga"], width=2)
    d.line([(68, 84), (68, 106)], fill=COR["viga"], width=2)
    # Vigas horizontais
    d.line([(54, 92), (74, 92)], fill=COR["viga"], width=1)
    d.line([(54, 100), (74, 100)], fill=COR["viga"], width=1)
    # Maçaneta de ferro
    d.ellipse([66, 96, 70, 100], fill=COR["ferro_escuro"])
    d.ellipse([66, 96, 68, 98], fill=COR["ferro_claro"])

    # ----- Seteiras (janelas estreitas para arqueiros) -----
    # Esquerda
    d.rectangle([32, 62, 36, 72], fill=COR["preto"])
    d.rectangle([32, 62, 36, 63], fill=COR["sombra"])
    # Direita
    d.rectangle([92, 62, 96, 72], fill=COR["preto"])
    d.rectangle([92, 62, 96, 63], fill=COR["sombra"])

    # ----- Brasão acima da porta -----
    # Escudo redondo de fundo
    d.ellipse([56, 56, 72, 72], fill=COR["cobre"], outline=COR["cobre_escuro"], width=2)
    # Símbolo (cruz)
    d.rectangle([62, 60, 66, 68], fill=COR["sangue"])
    d.rectangle([58, 62, 70, 66], fill=COR["sangue"])

    # ----- Bandeira no topo -----
    # Haste
    d.rectangle([63, 0, 65, 38], fill=COR["madeira_escura"])
    d.rectangle([63, 0, 65, 38], fill=COR["viga"])
    # Bandeira (reta para cima, ondulada)
    d.polygon([(65, 2), (90, 8), (65, 14)], fill=COR["sangue"], outline=COR["boca_escura"])
    # Highlight na bandeira
    d.polygon([(65, 2), (78, 5), (65, 8)], fill=(200, 50, 50, 255))
    # Emblema na bandeira (cruz dourada)
    d.rectangle([71, 5, 73, 11], fill=COR["cobre_claro"])
    d.rectangle([69, 7, 75, 9], fill=COR["cobre_claro"])

    # Adicionar ruído sutil para textura
    adicionar_ruido(img, intensidade=10)

    img.save(os.path.join(OUTPUT_DIR, "tower.png"))
    print("✓ tower.png gerada (128x128) - torre de pedra com ameias, porta, bandeira e brasão")


# ============================================================
# 2. GOBLIN (pequeno, verde, desarmado)
# ============================================================
def desenhar_goblin():
    img = nova_imagem(64)
    d = ImageDraw.Draw(img)

    # Sombra
    sombra_chao(d, 32, 58, 18, 5, 80)

    # Corpo (oval verde, visto de cima)
    d.ellipse([12, 14, 52, 54], fill=COR["goblin_verde"], outline=COR["goblin_escuro"], width=2)

    # Highlight no corpo (canto superior esquerdo)
    overlay = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([16, 16, 32, 32], fill=(170, 220, 110, 120))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Sombra inferior
    overlay = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([14, 40, 50, 56], fill=(60, 90, 30, 100))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Orelhas pontudas (duas)
    # Esquerda
    d.polygon([(8, 28), (16, 22), (16, 34)], fill=COR["goblin_verde"], outline=COR["goblin_escuro"])
    # Direita
    d.polygon([(56, 28), (48, 22), (48, 34)], fill=COR["goblin_verde"], outline=COR["goblin_escuro"])
    # Interior das orelhas (rosa)
    d.polygon([(11, 28), (15, 25), (15, 31)], fill=(200, 130, 130, 200))
    d.polygon([(53, 28), (49, 25), (49, 31)], fill=(200, 130, 130, 200))

    # Olhos amarelos (esbugalhados)
    # Esquerdo
    d.ellipse([20, 24, 30, 34], fill=COR["olho_amarelo"], outline=COR["preto"], width=2)
    d.ellipse([22, 26, 28, 32], fill=(255, 240, 100))
    # Pupila
    d.ellipse([24, 28, 27, 31], fill=COR["preto"])
    # Brilho
    d.ellipse([25, 28, 26, 29], fill=(255, 255, 255))

    # Direito
    d.ellipse([34, 24, 44, 34], fill=COR["olho_amarelo"], outline=COR["preto"], width=2)
    d.ellipse([36, 26, 42, 32], fill=(255, 240, 100))
    d.ellipse([38, 28, 41, 31], fill=COR["preto"])
    d.ellipse([39, 28, 40, 29], fill=(255, 255, 255))

    # Sobrancelhas franzidas
    d.line([(20, 22), (28, 24)], fill=COR["goblin_escuro"], width=2)
    d.line([(44, 22), (36, 24)], fill=COR["goblin_escuro"], width=2)

    # Boca malvada (sorriso dentuço)
    # Fundo da boca
    d.polygon([(22, 38), (42, 38), (40, 44), (24, 44)], fill=COR["boca_escura"])
    # Dentes pontiagudos
    d.polygon([(24, 38), (26, 38), (25, 42)], fill=COR["branco"])
    d.polygon([(28, 38), (30, 38), (29, 42)], fill=COR["branco"])
    d.polygon([(34, 38), (36, 38), (35, 42)], fill=COR["branco"])
    d.polygon([(38, 38), (40, 38), (39, 42)], fill=COR["branco"])

    # Pedra na mão (à direita)
    d.ellipse([46, 38, 58, 50], fill=(130, 130, 130, 255), outline=(70, 70, 70), width=2)
    # Highlight na pedra
    d.ellipse([48, 40, 52, 44], fill=(180, 180, 180, 200))
    # Vão do braço
    d.line([(42, 42), (47, 44)], fill=COR["goblin_escuro"], width=3)

    # Adicionar ruído
    adicionar_ruido(img, intensidade=8)

    img.save(os.path.join(OUTPUT_DIR, "enemy_goblin.png"))
    print("✓ enemy_goblin.png gerada (64x64) - goblin com olhos amarelos e pedra")


# ============================================================
# 3. OGRO COM CLAVA
# ============================================================
def desenhar_ogro():
    img = nova_imagem(96)
    d = ImageDraw.Draw(img)

    # Sombra
    sombra_chao(d, 48, 88, 32, 6, 100)

    # Corpo grande (oval verde escuro)
    d.ellipse([16, 18, 80, 82], fill=COR["ogro_verde"], outline=COR["ogro_escuro"], width=3)

    # Highlight no corpo
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([24, 24, 44, 42], fill=(140, 175, 100, 140))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Sombra inferior
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([18, 64, 78, 84], fill=(40, 60, 30, 130))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Músculos (linhas escuras)
    d.line([(48, 30), (48, 60)], fill=COR["ogro_escuro"], width=2)
    # Peitoral esquerdo
    d.arc([28, 35, 50, 60], 200, 340, fill=COR["ogro_escuro"], width=2)
    # Peitoral direito
    d.arc([46, 35, 68, 60], 200, 340, fill=COR["ogro_escuro"], width=2)
    # Abdômen (centro)
    d.arc([34, 50, 62, 72], 200, 340, fill=COR["ogro_escuro"], width=2)

    # ----- Braço grande segurando clava -----
    # Ombro
    d.ellipse([68, 38, 86, 56], fill=COR["pele_ogro"], outline=COR["ogro_escuro"], width=2)
    # Highlight no ombro
    d.ellipse([72, 40, 80, 48], fill=(180, 200, 130, 180))

    # ----- Clava de madeira enorme -----
    # Cabo
    d.rectangle([58, 6, 76, 38], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Veios da madeira (verticais)
    d.line([(62, 8), (62, 36)], fill=COR["madeira_escura"], width=1)
    d.line([(68, 8), (68, 36)], fill=COR["madeira_escura"], width=1)
    d.line([(72, 8), (72, 36)], fill=COR["madeira_escura"], width=1)

    # Cabeça da clava (mais larga, redonda)
    d.ellipse([52, 0, 82, 30], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Highlight na cabeça da clava
    d.ellipse([56, 4, 68, 16], fill=COR["madeira_clara"])
    # Nós da madeira
    d.ellipse([62, 6, 70, 14], fill=COR["madeira_escura"])
    d.ellipse([66, 12, 74, 20], fill=COR["madeira_escura"])

    # Cravos de ferro na clava
    for x in [56, 70, 78]:
        # Cabeça do cravo
        d.ellipse([x, 18, x + 5, 23], fill=COR["ferro_escuro"])
        d.ellipse([x, 18, x + 3, 21], fill=COR["ferro_claro"])
    # Cravos laterais
    for y in [6, 22]:
        d.ellipse([74, y, 79, y + 5], fill=COR["ferro_escuro"])
        d.ellipse([74, y, 76, y + 3], fill=COR["ferro_claro"])

    # ----- Olhos vermelhos -----
    # Esquerdo
    d.ellipse([30, 38, 42, 50], fill=COR["olho_vermelho"], outline=COR["preto"], width=2)
    d.ellipse([32, 40, 40, 48], fill=(255, 80, 80))
    # Pupila
    d.ellipse([34, 42, 38, 46], fill=COR["preto"])
    # Brilho
    d.ellipse([35, 42, 36, 43], fill=(255, 255, 255))

    # Direito
    d.ellipse([54, 38, 66, 50], fill=COR["olho_vermelho"], outline=COR["preto"], width=2)
    d.ellipse([56, 40, 64, 48], fill=(255, 80, 80))
    d.ellipse([58, 42, 62, 46], fill=COR["preto"])
    d.ellipse([59, 42, 60, 43], fill=(255, 255, 255))

    # Sobrancelhas franzidas
    d.line([(28, 36), (42, 38)], fill=COR["ogro_escuro"], width=4)
    d.line([(68, 36), (54, 38)], fill=COR["ogro_escuro"], width=4)

    # ----- Presas -----
    # Esquerda
    d.polygon([(40, 58), (46, 58), (43, 70)], fill=COR["branco"], outline=COR["preto"])
    d.polygon([(41, 59), (45, 59), (43, 67)], fill=(255, 250, 230))
    # Direita
    d.polygon([(50, 58), (56, 58), (53, 70)], fill=COR["branco"], outline=COR["preto"])
    d.polygon([(51, 59), (55, 59), (53, 67)], fill=(255, 250, 230))

    # Boca
    d.arc([38, 54, 58, 70], 0, 180, fill=COR["boca_escura"], width=3)
    # Língua
    d.pieslice([42, 56, 54, 70], 0, 180, fill=(160, 50, 60))

    # Adicionar ruído
    adicionar_ruido(img, intensidade=10)

    img.save(os.path.join(OUTPUT_DIR, "enemy_ogre.png"))
    print("✓ enemy_ogre.png gerada (96x96) - ogro musculoso com clava de madeira e cravos de ferro")


# ============================================================
# 4. OGRO BLINDADO (BOSS)
# ============================================================
def desenhar_ogro_blindado():
    img = nova_imagem(96)
    d = ImageDraw.Draw(img)

    # Sombra
    sombra_chao(d, 48, 88, 34, 7, 120)

    # Corpo com armadura de ferro (cinza metálico)
    d.ellipse([14, 18, 82, 82], fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)

    # Highlights metálicos (reflexos)
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([22, 22, 42, 42], fill=(255, 255, 255, 80))
    od.ellipse([24, 24, 36, 36], fill=(255, 255, 255, 120))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Sombra inferior
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([16, 66, 80, 84], fill=(0, 0, 0, 130))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Placas da armadura (linhas divisórias em forma de escudo)
    # Linha vertical central
    d.line([(48, 18), (48, 82)], fill=COR["ferro_escuro"], width=2)
    # Linhas curvas (peitoral)
    d.arc([14, 30, 82, 70], 180, 360, fill=COR["ferro_escuro"], width=2)
    d.arc([14, 30, 82, 70], 0, 180, fill=COR["ferro_escuro"], width=2)
    # Linhas adicionais
    d.arc([20, 38, 76, 70], 180, 360, fill=COR["ferro_escuro"], width=1)

    # Rebites (8 pontos) ao redor da armadura
    rivet_positions = [
        (24, 28), (72, 28),    # topo
        (24, 72), (72, 72),    # baixo
        (24, 50), (72, 50),    # meio lateral
        (48, 24), (48, 76),    # centro vertical
    ]
    for px, py in rivet_positions:
        # Sombra do rebite
        d.ellipse([px - 4, py - 3, px + 4, py + 5], fill=COR["ferro_escuro"])
        # Cabeça do rebite
        d.ellipse([px - 3, py - 4, px + 3, py + 2], fill=COR["ferro_claro"])
        # Highlight
        d.ellipse([px - 2, py - 3, px, py - 1], fill=COR["ferro_highlight"])

    # ----- Capacete de ferro (cobre a topo da cabeça) -----
    # Corpo do capacete
    d.rectangle([20, 8, 76, 42], fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)
    # Topo arredondado
    d.pieslice([20, -2, 76, 36], 180, 360, fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)

    # Highlight no capacete
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([22, 6, 30, 40], fill=(255, 255, 255, 80))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # Listras no capacete (decoração)
    d.line([(48, 4), (48, 40)], fill=COR["ferro_escuro"], width=2)

    # ----- Chifres -----
    # Esquerdo
    d.polygon([(20, 18), (4, 0), (14, 24)], fill=COR["branco"], outline=COR["preto"], width=2)
    # Highlight chifre esquerdo
    d.polygon([(18, 18), (8, 4), (12, 18)], fill=(255, 250, 230))
    # Sombras do chifre
    d.polygon([(15, 18), (5, 2), (8, 20)], fill=(180, 170, 150, 200))

    # Direito
    d.polygon([(76, 18), (92, 0), (82, 24)], fill=COR["branco"], outline=COR["preto"], width=2)
    d.polygon([(78, 18), (88, 4), (84, 18)], fill=(255, 250, 230))
    d.polygon([(81, 18), (91, 2), (88, 20)], fill=(180, 170, 150, 200))

    # ----- Fenda do capacete -----
    # Linha horizontal escura
    d.rectangle([26, 30, 70, 34], fill=COR["preto"])
    # Borda dourada na fenda
    d.rectangle([26, 30, 70, 31], fill=COR["cobre_escuro"])
    d.rectangle([26, 33, 70, 34], fill=COR["cobre_escuro"])

    # Olhos vermelhos brilhando através da fenda
    d.ellipse([32, 30, 40, 34], fill=COR["olho_vermelho"])
    d.ellipse([34, 30, 38, 34], fill=(255, 100, 100))
    # Brilho
    d.ellipse([35, 31, 37, 33], fill=(255, 255, 200))

    d.ellipse([56, 30, 64, 34], fill=COR["olho_vermelho"])
    d.ellipse([58, 30, 62, 34], fill=(255, 100, 100))
    d.ellipse([59, 31, 61, 33], fill=(255, 255, 200))

    # Aura de brilho vermelho nos olhos
    overlay = Image.new("RGBA", (96, 96), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse([28, 28, 44, 36], fill=(255, 50, 50, 60))
    od.ellipse([52, 28, 68, 36], fill=(255, 50, 50, 60))
    img = Image.alpha_composite(img, overlay)
    d = ImageDraw.Draw(img)

    # ----- Clava blindada (com bandas de ferro) -----
    # Cabo de madeira
    d.rectangle([66, 36, 80, 64], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Cabeça da clava
    d.ellipse([60, 30, 86, 56], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Bandas de ferro (3 faixas horizontais)
    for y in [34, 44, 50]:
        d.rectangle([60, y, 86, y + 4], fill=COR["ferro"], outline=COR["ferro_escuro"], width=1)
        # Highlights nas bandas
        d.rectangle([60, y, 86, y + 1], fill=COR["ferro_claro"])

    # Cravos grandes na clava
    for x, y in [(66, 38), (74, 38), (80, 38), (66, 48), (74, 48), (80, 48)]:
        d.ellipse([x - 1, y - 1, x + 3, y + 3], fill=COR["ferro_escuro"])
        d.ellipse([x - 1, y - 1, x + 1, y + 1], fill=COR["ferro_claro"])

    # Adicionar ruído
    adicionar_ruido(img, intensidade=12)

    img.save(os.path.join(OUTPUT_DIR, "enemy_armored_ogre.png"))
    print("✓ enemy_armored_ogre.png gerada (96x96) - ogro com armadura de ferro, capacete com chifres e clava reforçada")


# ============================================================
# 5. FLECHA MEDIEVAL
# ============================================================
def desenhar_flecha():
    img = nova_imagem(32)
    d = ImageDraw.Draw(img)

    # Sombra sutil
    d.line([(13, 28), (19, 28)], fill=(0, 0, 0, 100), width=3)

    # Haste de madeira (corpo)
    d.rectangle([14, 8, 18, 26], fill=COR["madeira"], outline=COR["madeira_escura"], width=1)
    # Veios da madeira no haste
    d.line([(15, 9), (15, 25)], fill=COR["madeira_clara"], width=1)
    d.line([(17, 9), (17, 25)], fill=COR["madeira_escura"], width=1)

    # ----- Ponta de ferro (triângulo no topo) -----
    # Sombra da ponta
    d.polygon([(17, 1), (10, 11), (22, 11)], fill=COR["ferro_escuro"])
    # Ponta principal
    d.polygon([(16, 0), (10, 10), (22, 10)], fill=COR["ferro"], outline=COR["ferro_escuro"], width=1)
    # Highlight na ponta
    d.polygon([(16, 2), (12, 9), (20, 9)], fill=COR["ferro_claro"])
    d.polygon([(16, 3), (14, 8), (18, 8)], fill=COR["ferro_highlight"])

    # ----- Penas brancas na base (3 penas em leque) -----
    # Pena esquerda
    d.polygon([(16, 26), (6, 32), (14, 22)], fill=COR["branco"], outline=COR["preto"], width=1)
    # Detalhes da pena (linhas)
    for i in range(3):
        d.line([(14 - i, 24 + i), (8, 30 + i)], fill=(180, 180, 160), width=1)

    # Pena direita
    d.polygon([(16, 26), (26, 32), (18, 22)], fill=COR["branco"], outline=COR["preto"], width=1)
    for i in range(3):
        d.line([(18 + i, 24 + i), (24, 30 + i)], fill=(180, 180, 160), width=1)

    # Pena central
    d.polygon([(16, 26), (12, 32), (20, 32)], fill=(220, 220, 200), outline=COR["preto"], width=1)
    d.line([(16, 26), (16, 32)], fill=(180, 180, 160), width=1)

    # Cordilhas (linha amarrando as penas)
    d.line([(13, 24), (19, 24)], fill=COR["cobre_escuro"], width=2)
    d.line([(13, 22), (19, 22)], fill=COR["cobre_escuro"], width=1)
    # Highlights nas cordilhas
    d.line([(13, 23), (19, 23)], fill=COR["cobre"], width=1)

    img.save(os.path.join(OUTPUT_DIR, "arrow.png"))
    print("✓ arrow.png gerada (32x32) - flecha com ponta de ferro, haste de madeira e penas brancas")


def main():
    print(f"Gerando sprites v2 em: {os.path.abspath(OUTPUT_DIR)}\n")
    desenhar_torre()
    desenhar_goblin()
    desenhar_ogro()
    desenhar_ogro_blindado()
    desenhar_flecha()
    print(f"\n✅ 5 imagens geradas com sucesso em {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
