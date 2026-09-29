/**
 * Cliente da football-data.org (v4).
 *
 * Duas responsabilidades que justificam esse arquivo existir separado
 * dos hooks: (1) nunca expor o token no bundle público — as chamadas
 * passam por /api/football (proxy), e (2) respeitar o limite de 10
 * requisições/minuto do plano gratuito com uma fila + cache em memória,
 * já que várias telas do dashboard podem pedir o mesmo recurso.
 */

const BASE_URL = '/api/football';
const RATE_LIMIT = 10; // requisições por minuto (plano free)
const WINDOW_MS = 60_000;
const CACHE_TTL_MS = 5 * 60_000; // dados de futebol mudam devagar — 5 min é seguro

const cache = new Map(); // url -> { data, expiresAt }
const requestTimestamps = [];
const queue = [];
let processing = false;

function pruneTimestamps() {
  const cutoff = Date.now() - WINDOW_MS;
  while (requestTimestamps.length && requestTimestamps[0] < cutoff) {
    requestTimestamps.shift();
  }
}

async function processQueue() {
  if (processing) return;
  processing = true;

  while (queue.length) {
    pruneTimestamps();

    if (requestTimestamps.length >= RATE_LIMIT) {
      const waitMs = WINDOW_MS - (Date.now() - requestTimestamps[0]) + 50;
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    const { url, resolve, reject } = queue.shift();
    try {
      requestTimestamps.push(Date.now());
      const res = await fetch(url);
      if (!res.ok) {
        // A API costuma devolver um corpo JSON com `message` explicando o
        // motivo real (ex: temporada fora do que o plano gratuito cobre).
        // Isso é bem mais útil que só expor o código HTTP.
        let apiMessage = '';
        try {
          const body = await res.json();
          apiMessage = body?.message ?? '';
        } catch {
          // corpo não era JSON — segue só com o status
        }
        const err = new Error(apiMessage || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
      resolve(data);
    } catch (err) {
      reject(err);
    }
  }

  processing = false;
}

/**
 * Busca um recurso da API, com cache e enfileiramento automáticos.
 * @param {string} path - ex: '/competitions/PL/standings'
 */
export function fetchFootballData(path) {
  const url = `${BASE_URL}${path}`;
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.data);
  }

  return new Promise((resolve, reject) => {
    queue.push({ url, resolve, reject });
    processQueue();
  });
}
