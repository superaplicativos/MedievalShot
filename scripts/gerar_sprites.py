#!/usr/bin/env python3
"""
============================================================
Medieval Kingshot - Gerador de Sprites PNG
============================================================
Gera as 5 imagens do jogo localmente (sem precisar de IA externa):
  - tower.png               (128x128) Torre de arqueiro medieval
  - enemy_goblin.png       (64x64)   Goblin verde pequeno
  - enemy_ogre.png          (96x96)   Ogro grande com clava
  - enemy_armored_ogre.png  (96x96)   Ogro com armadura de ferro
  - arrow.png              (32x32)   Flecha vista de cima

Estilo: pixel-art medieval, top-down, fundo transparente.
Paleta inspirada em Age of Empires 2.
============================================================
"""

import os
from PIL import Image, ImageDraw

# Diretório de saída (será copiado para public/assets/)
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "assets")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Paleta medieval
COR = {
    "pedra_escura":    (75, 75, 80, 255),
    "pedra":           (110, 110, 115, 255),
    "pedra_clara":     (155, 155, 160, 255),
    "sombra":          (50, 50, 55, 255),
    "madeira":         (140, 95, 50, 255),
    "madeira_escura":  (95, 60, 30, 255),
    "ferro":           (180, 180, 190, 255),
    "ferro_escuro":    (110, 110, 120, 255),
    "cobre":           (212, 165, 68, 255),
    "cobre_escuro":    (140, 95, 30, 255),
    "goblin_verde":    (120, 180, 70, 255),
    "goblin_escuro":   (75, 120, 45, 255),
    "ogro_verde":      (95, 130, 70, 255),
    "ogro_escuro":     (60, 85, 45, 255),
    "pele_ogro":       (140, 170, 100, 255),
    "branco":          (245, 240, 220, 255),
    "olho_vermelho":   (220, 50, 50, 255),
    "olho_amarelo":    (220, 200, 80, 255),
    "preto":           (20, 20, 25, 255),
    "sangue":          (140, 30, 30, 255),
    "viga":            (60, 40, 25, 255),
}


def nova_imagem(tamanho):
    """Cria uma imagem RGBA vazia (transparente)."""
    return Image.new("RGBA", (tamanho, tamanho), (0, 0, 0, 0))


def desenhar_torre():
    """
    Torre de arqueiro medieval de pedra, vista de cima.
    128x128, fundo transparente.
    """
    img = nova_imagem(128)
    d = ImageDraw.Draw(img)

    # Base circular de pedra (mais larga que o topo)
    # Sombra no chão (sutil)
    d.ellipse([8, 90, 120, 130], fill=(0, 0, 0, 70))

    # Base quadrada da torre (pedra)
    d.rectangle([28, 28, 100, 100], fill=COR["pedra"], outline=COR["pedra_escura"], width=3)

    # Textura de pedras (linhas horizontais + verticais simulando tijolos)
    for y in range(35, 100, 12):
        d.line([(28, y), (100, y)], fill=COR["pedra_escura"], width=1)
    # Tijolos alternados
    for y in range(35, 100, 12):
        offset = 18 if (y // 12) % 2 == 0 else 9
        for x in range(28 + offset, 100, 18):
            d.line([(x, y), (x, y + 11)], fill=COR["pedra_escura"], width=1)

    # Iluminação (canto superior esquerdo mais claro)
    for i in range(8):
        d.rectangle([28 + i, 28 + i, 100 - i, 28 + i + 1], fill=(155, 155, 160, 80 - i * 8))

    # Ameias no topo (4 pequenos quadrados)
    for x in [28, 50, 78, 100 - 14]:
        d.rectangle([x, 14, x + 14, 28], fill=COR["pedra_clara"], outline=COR["pedra_escura"], width=2)

    # Topo de madeira/cobre (parapeito interno)
    d.rectangle([36, 24, 92, 30], fill=COR["cobre"], outline=COR["cobre_escuro"], width=2)

    # Porta de madeira (embaixo)
    d.rectangle([56, 78, 72, 100], fill=COR["madeira_escura"], outline=COR["sombra"], width=2)
    # Detalhes da porta (vigas verticais)
    d.line([(60, 80), (60, 98)], fill=COR["viga"], width=1)
    d.line([(68, 80), (68, 98)], fill=COR["viga"], width=1)
    # Maçaneta
    d.ellipse([63, 92, 66, 95], fill=COR["cobre"])

    # Setas (decoração - 2 janelas/seteiras)
    d.rectangle([40, 50, 44, 58], fill=COR["preto"])
    d.rectangle([84, 50, 88, 58], fill=COR["preto"])
    # Bandeira no topo (haste + bandeira)
    d.line([(64, 0), (64, 14)], fill=COR["madeira_escura"], width=2)
    d.polygon([(64, 2), (78, 6), (64, 10)], fill=COR["sangue"])

    img.save(os.path.join(OUTPUT_DIR, "tower.png"))
    print("✓ tower.png gerada (128x128)")


def desenhar_goblin():
    """
    Goblin pequeno e verde, vista de cima, segurando pedra.
    64x64, fundo transparente.
    """
    img = nova_imagem(64)
    d = ImageDraw.Draw(img)

    # Sombra no chão
    d.ellipse([10, 50, 54, 60], fill=(0, 0, 0, 80))

    # Corpo (oval verde, visto de cima)
    d.ellipse([12, 14, 52, 54], fill=COR["goblin_verde"], outline=COR["goblin_escuro"], width=2)

    # Iluminação (highlight)
    d.ellipse([18, 18, 30, 28], fill=(160, 210, 100, 180))

    # Orelhas pontudas (duas)
    d.polygon([(10, 26), (18, 22), (18, 32)], fill=COR["goblin_verde"], outline=COR["goblin_escuro"])
    d.polygon([(54, 26), (46, 22), (46, 32)], fill=COR["goblin_verde"], outline=COR["goblin_escuro"])

    # Olhos amarelos (de cima, vendo de frente por inclinação)
    d.ellipse([22, 26, 30, 34], fill=COR["olho_amarelo"], outline=COR["preto"], width=1)
    d.ellipse([34, 26, 42, 34], fill=COR["olho_amarelo"], outline=COR["preto"], width=1)
    # Pupilas
    d.ellipse([25, 28, 28, 31], fill=COR["preto"])
    d.ellipse([37, 28, 40, 31], fill=COR["preto"])

    # Boca malvada (linha serrilhada)
    for i in range(4):
        x = 24 + i * 4
        if i % 2 == 0:
            d.line([(x, 40), (x + 4, 44)], fill=COR["preto"], width=1)
        else:
            d.line([(x, 44), (x + 4, 40)], fill=COR["preto"], width=1)

    # Pedra na mão (à direita)
    d.ellipse([46, 36, 56, 46], fill=(130, 130, 130, 255), outline=(80, 80, 80), width=1)

    # Braço visível
    d.line([(42, 38), (48, 40)], fill=COR["goblin_escuro"], width=3)

    img.save(os.path.join(OUTPUT_DIR, "enemy_goblin.png"))
    print("✓ enemy_goblin.png gerada (64x64)")


def desenhar_ogro():
    """
    Ogro grande e musculoso com clava de madeira.
    96x96, fundo transparente.
    """
    img = nova_imagem(96)
    d = ImageDraw.Draw(img)

    # Sombra
    d.ellipse([16, 80, 80, 92], fill=(0, 0, 0, 80))

    # Corpo grande (oval verde escuro)
    d.ellipse([16, 18, 80, 82], fill=COR["ogro_verde"], outline=COR["ogro_escuro"], width=3)

    # Iluminação
    d.ellipse([24, 24, 42, 40], fill=(130, 165, 90, 180))

    # Músculos (linhas escuras sugerindo volume)
    d.line([(48, 30), (48, 60)], fill=COR["ogro_escuro"], width=2)
    d.arc([28, 35, 60, 60], 200, 340, fill=COR["ogro_escuro"], width=2)
    d.arc([36, 35, 68, 60], 200, 340, fill=COR["ogro_escuro"], width=2)

    # Braço grande segurando clava (à direita)
    d.ellipse([68, 40, 86, 58], fill=COR["pele_ogro"], outline=COR["ogro_escuro"], width=2)

    # Clava de madeira enorme (sobre o ombro)
    # Cabo
    d.rectangle([60, 8, 72, 38], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Cabeça da clava (mais larga)
    d.ellipse([54, 0, 78, 22], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Detalhes de madeira (nós)
    d.ellipse([60, 4, 68, 12], fill=COR["madeira_escura"])
    d.ellipse([65, 8, 72, 15], fill=COR["madeira_escura"])
    # Cravos de ferro na clava
    for x in [58, 70]:
        d.ellipse([x, 12, x + 4, 16], fill=COR["ferro_escuro"])

    # Olhos vermelhos
    d.ellipse([32, 40, 42, 50], fill=COR["olho_vermelho"], outline=COR["preto"], width=1)
    d.ellipse([54, 40, 64, 50], fill=COR["olho_vermelho"], outline=COR["preto"], width=1)
    # Brilho
    d.ellipse([35, 42, 38, 45], fill=(255, 200, 200))
    d.ellipse([57, 42, 60, 45], fill=(255, 200, 200))

    # Presas (2 brancas saindo da boca)
    d.polygon([(42, 60), (46, 60), (44, 70)], fill=COR["branco"], outline=COR["preto"])
    d.polygon([(50, 60), (54, 60), (52, 70)], fill=COR["branco"], outline=COR["preto"])

    # Boca
    d.arc([40, 56, 56, 70], 0, 180, fill=COR["preto"], width=2)

    # Sobrancelhas franzidas
    d.line([(32, 38), (40, 40)], fill=COR["ogro_escuro"], width=3)
    d.line([(64, 38), (56, 40)], fill=COR["ogro_escuro"], width=3)

    img.save(os.path.join(OUTPUT_DIR, "enemy_ogre.png"))
    print("✓ enemy_ogre.png gerada (96x96)")


def desenhar_ogro_blindado():
    """
    Ogro com armadura de ferro completa e capacete com chifres.
    96x96, fundo transparente.
    """
    img = nova_imagem(96)
    d = ImageDraw.Draw(img)

    # Sombra
    d.ellipse([14, 80, 82, 92], fill=(0, 0, 0, 100))

    # Corpo com armadura de ferro (cinza metálico)
    d.ellipse([14, 18, 82, 82], fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)

    # Placas da armadura (linhas divisórias)
    d.line([(48, 18), (48, 82)], fill=COR["ferro_escuro"], width=2)
    d.arc([14, 30, 82, 70], 180, 360, fill=COR["ferro_escuro"], width=2)

    # Rebites (8 pontos) ao redor da armadura
    for px, py in [(24, 28), (72, 28), (24, 70), (72, 70), (24, 48), (72, 48), (48, 24), (48, 72)]:
        d.ellipse([px - 2, py - 2, px + 2, py + 2], fill=COR["ferro_escuro"])

    # Iluminação metálica (highlight)
    d.ellipse([22, 22, 36, 36], fill=(220, 220, 230, 150))

    # Capacete de ferro (cobre a parte de cima)
    d.rectangle([22, 8, 74, 40], fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)
    # Topo arredondado do capacete
    d.pieslice([22, 0, 74, 32], 180, 360, fill=COR["ferro"], outline=COR["ferro_escuro"], width=3)

    # Chifres (esquerdo e direito)
    d.polygon([(22, 18), (8, 4), (10, 22)], fill=COR["branco"], outline=COR["preto"], width=2)
    d.polygon([(74, 18), (88, 4), (86, 22)], fill=COR["branco"], outline=COR["preto"], width=2)

    # Fenda do capacete (linha horizontal escura)
    d.rectangle([28, 28, 68, 32], fill=COR["preto"])

    # Olhos vermelhos brilhando através da fenda
    d.ellipse([34, 27, 42, 33], fill=COR["olho_vermelho"])
    d.ellipse([54, 27, 62, 33], fill=COR["olho_vermelho"])
    # Brilho vermelho
    d.ellipse([36, 28, 40, 32], fill=(255, 150, 150))

    # Clava blindada (com bandas de ferro) na lateral direita
    d.rectangle([68, 36, 80, 60], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    d.ellipse([62, 30, 86, 54], fill=COR["madeira"], outline=COR["madeira_escura"], width=2)
    # Bandas de ferro envolvendo a clava
    d.rectangle([62, 36, 86, 40], fill=COR["ferro"], outline=COR["ferro_escuro"], width=1)
    d.rectangle([62, 44, 86, 48], fill=COR["ferro"], outline=COR["ferro_escuro"], width=1)

    img.save(os.path.join(OUTPUT_DIR, "enemy_armored_ogre.png"))
    print("✓ enemy_armored_ogre.png gerada (96x96)")


def desenhar_flecha():
    """
    Flecha medieval vista de cima (apontando para cima).
    32x32, fundo transparente.
    """
    img = nova_imagem(32)
    d = ImageDraw.Draw(img)

    # Sombra sutil abaixo
    d.line([(13, 28), (19, 28)], fill=(0, 0, 0, 80), width=2)

    # Haste de madeira (corpo da flecha)
    d.rectangle([14, 8, 18, 26], fill=COR["madeira"], outline=COR["madeira_escura"], width=1)
    # Highlight no haste
    d.line([(15, 9), (15, 25)], fill=(180, 140, 90), width=1)

    # Ponta de ferro (triângulo no topo)
    d.polygon([(16, 0), (10, 10), (22, 10)], fill=COR["ferro"], outline=COR["ferro_escuro"], width=1)
    # Highlight na ponta
    d.polygon([(16, 2), (13, 8), (19, 8)], fill=(220, 220, 230))

    # Penas brancas na base (3 penas em leque)
    d.polygon([(16, 26), (8, 30), (14, 22)], fill=COR["branco"], outline=COR["preto"], width=1)
    d.polygon([(16, 26), (24, 30), (18, 22)], fill=COR["branco"], outline=COR["preto"], width=1)
    # Pena central
    d.polygon([(16, 26), (12, 32), (20, 32)], fill=(220, 220, 200), outline=COR["preto"], width=1)

    # Cordilhas (linha amarrando as penas)
    d.line([(13, 24), (19, 24)], fill=COR["cobre_escuro"], width=1)
    d.line([(13, 22), (19, 22)], fill=COR["cobre_escuro"], width=1)

    img.save(os.path.join(OUTPUT_DIR, "arrow.png"))
    print("✓ arrow.png gerada (32x32)")


def main():
    print(f"Gerando sprites em: {os.path.abspath(OUTPUT_DIR)}\n")
    desenhar_torre()
    desenhar_goblin()
    desenhar_ogro()
    desenhar_ogro_blindado()
    desenhar_flecha()
    print(f"\n✅ 5 imagens geradas com sucesso em {os.path.abspath(OUTPUT_DIR)}")


if __name__ == "__main__":
    main()
