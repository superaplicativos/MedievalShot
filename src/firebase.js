// ============================================================
// Medieval Kingshot - Configuração do Firebase (Single-Player)
// ============================================================
// Backend 100% single-player. Sem Realtime Database.
// Usa apenas:
//   - Authentication (Login Anônimo)
//   - Firestore (Salvamento de progresso + Ranking global)
//
// Coleção 'players' (1 documento por jogador):
//   {
//     uid: string,
//     nickname: string,           // nome de exibição no ranking
//     level: number,              // maior nível desbloqueado (1, 2, 3...)
//     coins: number,              // moedas acumuladas
//     score: number,              // pontuação total no ranking
//     kills: number,              // total de inimigos mortos
//     bestTimeMs: number,         // melhor tempo de sobrevivência
//     updatedAt: timestamp,
//     createdAt: timestamp
//   }
// ============================================================

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
} from 'firebase/firestore';

// ------------------------------------------------------------
// 1. CONFIGURAÇÃO DO FIREBASE
// ------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Flag que indica se o Firebase está configurado corretamente
export const firebaseConfigurado =
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  !firebaseConfig.projectId.startsWith('YOUR_') &&
  !firebaseConfig.appId.startsWith('YOUR_');

// ------------------------------------------------------------
// 2. INICIALIZAÇÃO DOS SERVIÇOS
// ------------------------------------------------------------
let app = null;
let auth = null;
let db = null;

if (firebaseConfigurado) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('[Firebase] Inicializado com sucesso.');
  } catch (erro) {
    console.warn('[Firebase] Falha ao inicializar:', erro);
  }
} else {
  console.warn(
    '[Firebase] Configuração não encontrada. Rodando em modo OFFLINE.\n' +
      'Copie .env.example para .env e preencha com suas chaves.'
  );
}

// ------------------------------------------------------------
// 3. LOGIN ANÔNIMO
// ------------------------------------------------------------
const STORAGE_UID_KEY = 'medieval_kingshot_uid';
const STORAGE_PROFILE_KEY = 'medieval_kingshot_profile';

let usuarioAtual = null;

/**
 * Faz login anônimo no Firebase.
 * No modo offline, gera um ID local persistente.
 * @returns {Promise<{uid: string, anonimo: boolean, offline: boolean}>}
 */
export async function loginAnonimo() {
  // Modo offline
  if (!firebaseConfigurado || !auth) {
    let uid = localStorage.getItem(STORAGE_UID_KEY);
    if (!uid) {
      uid = 'local-' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem(STORAGE_UID_KEY, uid);
    }
    usuarioAtual = { uid, anonimo: true, offline: true };
    console.log('[Auth] Modo offline. UID local:', uid);
    return usuarioAtual;
  }

  // Modo online
  try {
    const resultado = await signInAnonymously(auth);
    usuarioAtual = {
      uid: resultado.user.uid,
      anonimo: true,
      offline: false,
    };
    localStorage.setItem(STORAGE_UID_KEY, usuarioAtual.uid);
    console.log('[Auth] Login anônimo realizado. UID:', usuarioAtual.uid);
    return usuarioAtual;
  } catch (erro) {
    console.error('[Auth] Erro no login anônimo:', erro);
    // Fallback offline
    let uid = localStorage.getItem(STORAGE_UID_KEY);
    if (!uid) {
      uid = 'fallback-' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem(STORAGE_UID_KEY, uid);
    }
    usuarioAtual = { uid, anonimo: true, offline: true };
    return usuarioAtual;
  }
}

export function getUsuarioAtual() {
  return usuarioAtual;
}

export function observarAuth(callback) {
  if (!firebaseConfigurado || !auth) {
    callback(usuarioAtual);
    return () => {};
  }
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      usuarioAtual = { uid: user.uid, anonimo: true, offline: false };
    }
    callback(user ? usuarioAtual : null);
  });
}

// ------------------------------------------------------------
// 4. SALVAMENTO DE PROGRESSO
// ------------------------------------------------------------

/**
 * Salva/atualiza o progresso do jogador.
 *
 * @param {Object} dados - { level, coins, score?, kills?, bestTimeMs? }
 * @returns {Promise<boolean>}
 */
export async function salvarProgresso(dados) {
  if (!usuarioAtual) {
    console.warn('[Firestore] Usuário não logado. Não é possível salvar.');
    return false;
  }

  // Mescla com dados existentes
  const dadosCompletos = {
    uid: usuarioAtual.uid,
    nickname: dados.nickname || `Guerreiro-${usuarioAtual.uid.substring(0, 6)}`,
    level: dados.level ?? 1,
    coins: dados.coins ?? 0,
    score: dados.score ?? 0,
    kills: dados.kills ?? 0,
    bestTimeMs: dados.bestTimeMs ?? 0,
    updatedAt: Date.now(),
  };

  // Modo offline
  if (!firebaseConfigurado || !db) {
    const local = localStorage.getItem(STORAGE_PROFILE_KEY);
    const existente = local ? JSON.parse(local) : {};
    const merged = { ...existente, ...dadosCompletos };
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(merged));
    console.log('[Firestore] (offline) Progresso salvo:', merged);
    return true;
  }

  // Modo online (merge para não sobrescrever campos antigos)
  try {
    const refDoc = doc(db, 'players', usuarioAtual.uid);
    // Se for novo documento, adiciona createdAt
    const snap = await getDoc(refDoc);
    if (!snap.exists()) {
      dadosCompletos.createdAt = Date.now();
    }
    await setDoc(refDoc, dadosCompletos, { merge: true });
    console.log('[Firestore] Progresso salvo:', dadosCompletos);
    return true;
  } catch (erro) {
    console.error('[Firestore] Erro ao salvar:', erro);
    const local = localStorage.getItem(STORAGE_PROFILE_KEY);
    const existente = local ? JSON.parse(local) : {};
    const merged = { ...existente, ...dadosCompletos };
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(merged));
    return false;
  }
}

/**
 * Carrega o progresso do jogador logado.
 * @returns {Promise<Object|null>}
 */
export async function carregarProgresso() {
  if (!usuarioAtual) return null;

  if (!firebaseConfigurado || !db) {
    const local = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (local) return JSON.parse(local);
    return { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
  }

  try {
    const refDoc = doc(db, 'players', usuarioAtual.uid);
    const snap = await getDoc(refDoc);
    if (snap.exists()) {
      const dados = snap.data();
      console.log('[Firestore] Progresso carregado:', dados);
      return dados;
    }
    return { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0, nickname: null };
  } catch (erro) {
    console.error('[Firestore] Erro ao carregar:', erro);
    const local = localStorage.getItem(STORAGE_PROFILE_KEY);
    return local ? JSON.parse(local) : { level: 1, coins: 0, score: 0, kills: 0, bestTimeMs: 0 };
  }
}

/**
 * Define o nickname do jogador (mostrado no ranking).
 * @param {string} nickname
 */
export async function setNickname(nickname) {
  if (!usuarioAtual || !nickname) return false;
  return salvarProgresso({ nickname: nickname.substring(0, 16).trim() });
}

// ------------------------------------------------------------
// 5. SISTEMA DE RANKING
// ------------------------------------------------------------
// Ranking baseado no campo 'score' (pontuação total acumulada).
// Quanto maior o score, melhor a posição.
// ------------------------------------------------------------

/**
 * Submete o score de uma partida ao ranking.
 * Soma ao score total, atualiza kills e bestTime.
 *
 * @param {Object} resultadoPartida - { scoreGanho, kills, tempoSobrevivenciaMs, level, coins }
 * @returns {Promise<{novoScoreTotal: number, posicaoRanking: number}>}
 */
export async function submeterScore(resultadoPartida) {
  if (!usuarioAtual) {
    console.warn('[Ranking] Usuário não logado.');
    return { novoScoreTotal: 0, posicaoRanking: -1 };
  }

  // Carrega progresso atual
  const atual = await carregarProgresso();
  const novoScoreTotal = (atual.score || 0) + (resultadoPartida.scoreGanho || 0);
  const totalKills = (atual.kills || 0) + (resultadoPartida.kills || 0);
  const novoLevel = Math.max(atual.level || 1, resultadoPartida.level || 1);
  const totalCoins = (atual.coins || 0) + (resultadoPartida.coins || 0);
  const bestTimeMs = Math.max(atual.bestTimeMs || 0, resultadoPartida.tempoSobrevivenciaMs || 0);

  // Salva progresso atualizado
  await salvarProgresso({
    level: novoLevel,
    coins: totalCoins,
    score: novoScoreTotal,
    kills: totalKills,
    bestTimeMs,
  });

  // Busca a posição do jogador no ranking
  const posicao = await getMinhaPosicaoRanking();

  return { novoScoreTotal, posicaoRanking: posicao };
}

/**
 * Busca o top 10 jogadores do ranking global.
 * Ordenado por score (desc).
 *
 * @returns {Promise<Array<{uid, nickname, score, level, kills}>>}
 */
export async function getTop10() {
  if (!firebaseConfigurado || !db) {
    console.warn('[Ranking] (offline) Ranking indisponível no modo offline.');
    // Modo offline: retorna apenas o jogador local
    const local = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (local) {
      const dados = JSON.parse(local);
      return [{
        uid: dados.uid || 'local',
        nickname: dados.nickname || 'Você (offline)',
        score: dados.score || 0,
        level: dados.level || 1,
        kills: dados.kills || 0,
      }];
    }
    return [];
  }

  try {
    const q = query(collection(db, 'players'), orderBy('score', 'desc'), limit(10));
    const snap = await getDocs(q);
    const top = [];
    snap.forEach((docSnap) => {
      const dados = docSnap.data();
      top.push({
        uid: docSnap.id,
        nickname: dados.nickname || 'Anônimo',
        score: dados.score || 0,
        level: dados.level || 1,
        kills: dados.kills || 0,
      });
    });
    console.log('[Ranking] Top 10 carregado:', top.length, 'jogadores');
    return top;
  } catch (erro) {
    console.error('[Ranking] Erro ao buscar top 10:', erro);
    return [];
  }
}

/**
 * Busca a posição do jogador atual no ranking global.
 * Conta quantos jogadores têm score maior que o seu.
 *
 * @returns {Promise<number>} 1-indexed position, ou -1 se não classificado
 */
export async function getMinhaPosicaoRanking() {
  if (!firebaseConfigurado || !db || !usuarioAtual) {
    return -1;
  }

  try {
    const atual = await carregarProgresso();
    if (!atual || !atual.score) return -1;

    // Conta jogadores com score maior
    const q = query(collection(db, 'players'), where('score', '>', atual.score));
    const snap = await getDocs(q);
    const posicao = snap.size + 1; // 1-indexed
    console.log('[Ranking] Posição atual:', posicao);
    return posicao;
  } catch (erro) {
    console.error('[Ranking] Erro ao buscar posição:', erro);
    return -1;
  }
}

/**
 * Busca os 5 jogadores imediatamente acima e abaixo da posição
 * do jogador atual (para contexto no ranking).
 *
 * @returns {Promise<{acima: Array, abaixo: Array, minhaPosicao: number, meuScore: number}>}
 */
export async function getRankingContexto() {
  const resultado = { acima: [], abaixo: [], minhaPosicao: -1, meuScore: 0 };

  if (!firebaseConfigurado || !db || !usuarioAtual) {
    return resultado;
  }

  try {
    const atual = await carregarProgresso();
    if (!atual || !atual.score) return resultado;

    resultado.meuScore = atual.score || 0;
    resultado.minhaPosicao = await getMinhaPosicaoRanking();

    // Jogadores com score maior (acima no ranking) - top 5
    const qAcima = query(
      collection(db, 'players'),
      where('score', '>', atual.score),
      orderBy('score', 'asc'),
      limit(5)
    );
    const snapAcima = await getDocs(qAcima);
    snapAcima.forEach((docSnap) => {
      const d = docSnap.data();
      resultado.acima.push({
        uid: docSnap.id,
        nickname: d.nickname || 'Anônimo',
        score: d.score || 0,
      });
    });

    // Jogadores com score menor (abaixo) - top 5
    const qAbaixo = query(
      collection(db, 'players'),
      where('score', '<', atual.score),
      orderBy('score', 'desc'),
      limit(5)
    );
    const snapAbaixo = await getDocs(qAbaixo);
    snapAbaixo.forEach((docSnap) => {
      const d = docSnap.data();
      resultado.abaixo.push({
        uid: docSnap.id,
        nickname: d.nickname || 'Anônimo',
        score: d.score || 0,
      });
    });

    return resultado;
  } catch (erro) {
    console.error('[Ranking] Erro ao buscar contexto:', erro);
    return resultado;
  }
}

// ------------------------------------------------------------
// 6. ESTATÍSTICAS GLOBAIS (extras para a tela de ranking)
// ------------------------------------------------------------

/**
 * Busca estatísticas globais do jogo (totais agregados).
 * @returns {Promise<{totalJogadores: number, maiorScore: number}>}
 */
export async function getEstatisticasGlobais() {
  if (!firebaseConfigurado || !db) {
    return { totalJogadores: 1, maiorScore: 0 };
  }

  try {
    const snap = await getDocs(collection(db, 'players'));
    let totalJogadores = 0;
    let maiorScore = 0;
    snap.forEach((docSnap) => {
      totalJogadores++;
      const d = docSnap.data();
      if (d.score && d.score > maiorScore) maiorScore = d.score;
    });
    return { totalJogadores, maiorScore };
  } catch (erro) {
    console.error('[Stats] Erro ao buscar estatísticas:', erro);
    return { totalJogadores: 0, maiorScore: 0 };
  }
}

// ------------------------------------------------------------
// 7. EXPORTAÇÃO DE SERVIÇOS
// ------------------------------------------------------------
export { app, auth, db };
