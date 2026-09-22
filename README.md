# ⚔️ Medieval Kingshot

Tower Defense medieval **single-player** com **sistema de ranking global**.

Construído com **Phaser 3 + Firebase + Vite**, deployável para **GitHub Pages** (grátis).

---

## 🎮 Características

- **Single-Player**: 2 fases isoladas (Goblins e Ogros + Boss)
- **Sistema de Ranking Global**: top 10 + sua posição no ranking
- **Login Anônimo**: ID único sem senha (Firebase Auth)
- **Salvamento na nuvem**: progresso sincronizado via Firestore
- **Nickname personalizável**: edite seu nome no ranking
- **Modo Offline**: joga mesmo sem configurar o Firebase
- **Sprites gerados localmente**: 5 imagens PNG criadas via Python/Pillow (sem precisar de IA externa)
- **Placeholders visuais**: fallback automático caso as imagens falhem

---

## 📁 Estrutura do Projeto

```
medieval-kingshot/
├── .github/workflows/
│   └── deploy.yml               # CI/CD para GitHub Pages
├── assets/
│   └── prompts_imagens.md       # Documentação dos sprites (referência)
├── public/
│   └── assets/                  # 5 imagens PNG já geradas
│       ├── tower.png
│       ├── enemy_goblin.png
│       ├── enemy_ogre.png
│       ├── enemy_armored_ogre.png
│       └── arrow.png
├── scripts/
│   └── gerar_sprites.py         # Script Python que gera os sprites PNG
├── src/
│   ├── main.js                  # Entry point do Phaser
│   ├── firebase.js              # Firebase (Auth + Firestore + Ranking)
│   ├── objects/
│   │   ├── Tower.js             # Classe da torre do jogador
│   │   ├── Enemy.js             # Goblin, Ogro, Ogro Blindado
│   │   └── Projectile.js        # Flecha
│   └── scenes/
│       ├── BootScene.js         # Placeholders de fallback
│       ├── PreloadScene.js      # Carrega imagens reais
│       ├── MenuScene.js         # Menu principal
│       ├── RankingScene.js      # Tela de Ranking Global
│       ├── Level01Scene.js      # Fase 1: Goblins
│       └── Level02Scene.js      # Fase 2: Ogros + Boss (Ogro Blindado)
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js 18+ (recomendado 20)
- npm 9+
- Python 3.8+ com Pillow (apenas para regenerar sprites, opcional)

### Passo a passo

1. **Clone o repositório**
   ```bash
   git clone https://github.com/SEU_USUARIO/medieval-kingshot.git
   cd medieval-kingshot
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **(Opcional) Regenerar as 5 imagens dos sprites**
   ```bash
   # Requer: pip install Pillow
   npm run sprites
   # ou: python3 scripts/gerar_sprites.py
   ```

4. **(Opcional) Configure o Firebase** — veja a seção abaixo.

5. **Rode em modo desenvolvimento**
   ```bash
   npm run dev
   ```
   Acesse: http://localhost:5173

6. **Build de produção**
   ```bash
   npm run build
   ```

---

## 🔥 Configurando o Firebase (grátis - Spark Plan)

O jogo roda em modo offline por padrão. Para habilitar login, salvamento na nuvem e ranking global:

### Passo 1: Criar projeto Firebase
1. Acesse https://console.firebase.google.com/
2. **Adicionar projeto** → dê um nome → conclua

### Passo 2: Habilitar serviços
1. **Authentication**: Build → Authentication → Sign-in method → ative **Anônimo**
2. **Firestore Database**: Build → Firestore Database → Criar banco

> ⚠️ Não é mais necessário o Realtime Database (multiplayer foi removido).

### Passo 3: Regras do Firestore
Em Firestore Database → Regras, cole:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /players/{playerId} {
      allow read: if true;  // ranking é público
      allow write: if request.auth != null && request.auth.uid == playerId;
    }
  }
}
```

### Passo 4: Pegar as chaves
1. Engrenagem (Configurações do projeto) → Seus apps → `</>` (Web)
2. Copie os valores do objeto `firebaseConfig`

### Passo 5: Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite `.env` e preencha com suas chaves:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abc123
```

Reinicie o `npm run dev`. O badge no menu deve mudar de 🔴 Offline para 🟢 Online.

---

## 🏆 Sistema de Ranking

### Como funciona
- Cada inimigo morto concede **pontos de score** (ex: goblin = 15 pts, ogro = 40 pts, ogro blindado = 100 pts)
- Vencer uma fase concede **bônus de vitória** (200 pts na Fase 1, 500 pts na Fase 2)
- O score total é acumulado entre partidas no Firestore
- O ranking mostra os **top 10 jogadores globais**
- A sua posição é calculada contando quantos jogadores têm score maior que o seu

### Tela de Ranking
Acesse pelo menu: **🏆 RANKING GLOBAL**

A tela mostra:
- **Estatísticas globais**: total de jogadores + maior score
- **Top 10**: medalhas 🥇🥈🥉 para os 3 primeiros
- **Sua posição**: posição atual + 3 jogadores acima e 2 abaixo (contexto)

### Nickname
No menu, clique em **✏ EDITAR NICKNAME** para definir seu nome de exibição (máx 16 caracteres). O nickname aparece no ranking global.

---

## 🎨 Sprites (Imagens)

As 5 imagens do jogo são **geradas localmente** via Python/Pillow:

| Arquivo | Tamanho | Descrição |
|---------|---------|-----------|
| `tower.png` | 128x128 | Torre de arqueiro de pedra com ameias, porta e bandeira |
| `enemy_goblin.png` | 64x64 | Goblin verde com orelhas pontudas e olhos amarelos |
| `enemy_ogre.png` | 96x96 | Ogro musculoso segurando clava de madeira |
| `enemy_armored_ogre.png` | 96x96 | Ogro com armadura de ferro, capacete com chifres |
| `arrow.png` | 32x32 | Flecha medieval vista de cima |

### Como regenerar
```bash
pip install Pillow
python3 scripts/gerar_sprites.py
```

As imagens são geradas em `public/assets/`. O script é totalmente editável — altere cores, formas e tamanhos em `scripts/gerar_sprites.py`.

### Substituir por imagens de IA
Se quiser usar sprites de IA (Midjourney/DALL-E), basta substituir os arquivos em `public/assets/` mantendo os mesmos nomes. O Phaser carrega automaticamente.

---

## 🌐 Deploy para GitHub Pages

### Passo 1: Crie o repositório no GitHub
1. https://github.com/new
2. Nome: `medieval-kingshot`
3. Público
4. **NÃO** inicialize com README

### Passo 2: Faça o primeiro commit
```bash
cd medieval-kingshot
git init
git add .
git commit -m "feat: Medieval Kingshot - single-player + ranking"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/medieval-kingshot.git
git push -u origin main
```

> 🔒 **Sobre tokens do GitHub**:
> Use seu token pessoal **apenas no prompt de senha** do git.
> NUNCA coloque o token em arquivos do projeto, commits, ou compartilhe em chats.
> Configure: `git config --global credential.helper store`
> Ou use SSH com chaves públicas (mais seguro).

### Passo 3: Ative o GitHub Pages
1. No GitHub: **Settings → Pages**
2. Em **Source**, escolha **GitHub Actions**
3. Salve

### Passo 4: Acompanhe o deploy
1. Vá na aba **Actions**
2. Veja o workflow "Deploy para GitHub Pages" rodando
3. Quando terminar (2-3 min), acesse:
   ```
   https://SEU_USUARIO.github.io/medieval-kingshot/
   ```

### Passo 5: Adicionar chaves do Firebase (se configurou Firebase)
1. No GitHub: **Settings → Secrets and variables → Actions**
2. Adicione cada variável:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Edite `.github/workflows/deploy.yml` e **descomente** as linhas das chaves na seção `env:`
4. Commit + push. O próximo deploy já usará suas chaves.

---

## 🎯 Como Jogar

1. **Menu principal**: escolha **JOGAR** para iniciar na última fase desbloqueada
2. **Selecionar Fase**: jogue fases específicas (Fase 2 só destrava depois de vencer a Fase 1)
3. **Mecânica**:
   - Sua torre está no centro da arena
   - Inimigos surgem das 4 bordas e caminham em direção à torre
   - A torre atira automaticamente flechas no inimigo mais próximo
   - Se um inimigo tocar sua torre, ela perde HP
4. **Vitória**: sobreviva o tempo necessário ou mate X inimigos
5. **Boss**: na Fase 2, aos 60s um **Ogro Blindado** surge como desafio final
6. **Ranking**: cada kill e cada vitória somam pontos ao seu score global

---

## 🛠️ Stack Técnica

| Camada        | Tecnologia                |
| ------------- | ------------------------- |
| Motor de jogo | Phaser 3.80               |
| Bundler       | Vite 5                    |
| Backend       | Firebase v10 (Spark Plan) |
| Auth          | Firebase Anonymous Auth   |
| Banco NoSQL   | Firestore                 |
| Hospedagem    | GitHub Pages              |
| CI/CD         | GitHub Actions            |
| Geração de sprites | Python + Pillow     |

---

## 📝 Licença

MIT — sinta-se livre para usar, modificar e distribuir.

---

## ❓ FAQ

**O jogo não conecta no Firebase!**
- Verifique se o `.env` está na raiz do projeto
- Verifique se reiniciou o `npm run dev` depois de criar o `.env`
- Verifique no console do navegador mensagens de erro
- Confirme que habilitou **Login Anônimo** no Authentication

**Meu score não aparece no ranking!**
- Verifique se está online (badge 🟢 no menu)
- Defina um nickname em "✏ EDITAR NICKNAME"
- Jogue uma partida e vença ou morra — o score é submetido automaticamente ao fim
- O ranking pode levar alguns segundos para atualizar no Firestore

**Como adicionar mais fases?**
- Crie `src/scenes/Level03Scene.js` baseado na `Level02Scene.js`
- Registre a cena em `src/main.js`
- Configure `proximaFase: 'Level03Scene'` na fase anterior
- Use `TIPOS_INIMIGO.ogroBlindado` como inimigo principal

**Como adicionar novos inimigos?**
- Adicione uma entrada em `TIPOS_INIMIGO` em `src/objects/Enemy.js`
- Gere um sprite novo em `scripts/gerar_sprites.py`
- Carregue a textura em `src/scenes/PreloadScene.js`

**O deploy falhou no GitHub Actions!**
- Settings → Pages → Source: deve estar em **GitHub Actions**
- Verifique os logs na aba Actions
- Lembre-se: `base: './'` no `vite.config.js` é obrigatório para subdiretórios
