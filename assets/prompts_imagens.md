# Sprites do Medieval Kingshot — Documentação de Referência

> ✅ **As 5 imagens já estão geradas** em `public/assets/` via `scripts/gerar_sprites.py`.
> Você **não precisa** usar geradores de IA externos (Midjourney/DALL-E).

Este arquivo serve como **documentação** caso queira:
1. Substituir os sprites por imagens geradas por IA posteriormente
2. Entender o que cada sprite representa
3. Usar como referência de estilo para novas imagens

---

## Estilo coerente

> 2D game sprite, medieval fantasy, Age of Empires 2 style, top-down view, transparent background, vibrant colors

---

## 1. Torre Principal (Castelo de Arqueiro)

- **Arquivo atual:** `public/assets/tower.png`
- **Tamanho:** 128x128 px
- **Descrição:** Torre de pedra medieval com base quadrada, ameias no topo, porta de madeira, bandeira vermelha no topo, janelas/seteiras.

**Prompt de referência (caso queira gerar por IA):**
```
2D game sprite of a medieval stone archer tower, top-down view, Age of Empires 2
style, square base with crenellated battlements on top, small wooden door at the
bottom, arrow slits on each side, weathered gray stone texture with moss accents,
fantasy game art, transparent background, vibrant colors, clean pixel-art shading,
highly detailed, centered, no shadows on ground
```

---

## 2. Inimigo Fase 1 — Goblin

- **Arquivo atual:** `public/assets/enemy_goblin.png`
- **Tamanho:** 64x64 px
- **Descrição:** Goblin verde pequeno com orelhas pontudas, olhos amarelos, segurando uma pedra.

**Prompt de referência:**
```
2D game sprite of a small green goblin enemy, top-down view, Age of Empires 2
style, tiny humanoid creature with big pointed ears, holding a small crude stone
in its hand, ragged brown loincloth, mischievous yellow eyes, slightly hunched
posture, fantasy game art, transparent background, vibrant colors
```

---

## 3. Inimigo Fase 2 — Ogro com Pau

- **Arquivo atual:** `public/assets/enemy_ogre.png`
- **Tamanho:** 96x96 px
- **Descrição:** Ogro grande e musculoso verde-escuro segurando clava de madeira enorme.

**Prompt de referência:**
```
2D game sprite of a large muscular ogre enemy, top-down view, Age of Empires 2
style, huge bulky humanoid with green-gray skin, holding an enormous wooden club
over its shoulder, crude leather shoulder strap, small tusks protruding from
lower jaw, angry red eyes, brutish posture, fantasy game art, transparent
background, vibrant colors
```

---

## 4. Boss Fase 2 — Ogro Blindado

- **Arquivo atual:** `public/assets/enemy_armored_ogre.png`
- **Tamanho:** 96x96 px
- **Descrição:** Ogro com armadura de ferro completa, capacete com chifres, clava com bandas de ferro.

**Prompt de referência:**
```
2D game sprite of a massive armored ogre enemy, top-down view, Age of Empires 2
style, hulking humanoid covered in heavy iron plate armor with rivets, rusted
metal helmet with horns, small gaps revealing green skin, still wielding a large
wooden club reinforced with iron bands, menacing glowing red eyes through the
helmet slit, fantasy game art, transparent background, vibrant colors
```

---

## 5. Projétil — Flecha Medieval

- **Arquivo atual:** `public/assets/arrow.png`
- **Tamanho:** 32x32 px
- **Descrição:** Flecha vista de cima, com ponta de ferro, haste de madeira e penas brancas.

**Prompt de referência:**
```
2D game sprite of a single medieval arrow seen from top-down view, Age of
Empires 2 style, wooden shaft with brown texture, sharp iron arrowhead pointing
upward, white feathered fletching at the tail, realistic proportions, fantasy
game art, transparent background, vibrant colors
```

---

## Como regenerar os sprites com Python

Os sprites são gerados pelo script `scripts/gerar_sprites.py` usando Pillow.
Para customizar:

1. Edite o arquivo `scripts/gerar_sprites.py`
2. Altere as cores em `COR = { ... }` no topo do arquivo
3. Modifique as funções `desenhar_*()` para mudar as formas
4. Execute:
   ```bash
   python3 scripts/gerar_sprites.py
   ```

As imagens serão regeneradas em `public/assets/`.
