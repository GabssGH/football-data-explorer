/**
 * Cliente da TheSportsDB (v1) — usada só pra histórico multi-temporada,
 * já que a football-data.org free tier não dá acesso a temporadas
 * passadas.
 *
 * Por padrão usa a chave de teste pública "123" (a atual, segundo a
 * documentação oficial — compartilhada, sem custo, ~30 req/min). Se
 * você apoiar o Patreon deles (a partir de US$9/mês pra Premium) e
 * receber uma chave paga, defina VITE_THESPORTSDB_KEY no seu .env
 * — o projeto passa a usá-la automaticamente, sem precisar mexer em
 * mais nada.
 */
const API_KEY = import.meta.env.VITE_THESPORTSDB_KEY || '123';
const BASE_URL = `https://www.thesportsdb.com/api/v1/json/${API_KEY}`;
const CACHE_TTL_MS = 30 * 60_000; // dado histórico muda raramente — cache mais longo

const cache = new Map();

async function fetchTSDB(path, attempt = 1) {
  const url = `${BASE_URL}${path}`;
  const cached = cache.get(url);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const MAX_ATTEMPTS = 3;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`TheSportsDB respondeu ${res.status}`);
    }
    const data = await res.json();
    cache.set(url, { data, expiresAt: Date.now() + CACHE_TTL_MS });
    return data;
  } catch (err) {
    // "Failed to fetch" e erros de status 429/5xx costumam ser falhas
    // temporárias (chave gratuita compartilhada sobrecarregada, instabilidade
    // pontual) — vale tentar de novo com espera crescente antes de desistir.
    if (attempt < MAX_ATTEMPTS) {
      await sleep(attempt * 2000);
      return fetchTSDB(path, attempt + 1);
    }
    throw err;
  }
}

/** Tabela de classificação de uma liga numa temporada específica (formato "2020-2021" ou "2024"). */
export async function getSeasonTable(leagueId, seasonLabel) {
  const data = await fetchTSDB(`/lookuptable.php?l=${leagueId}&s=${encodeURIComponent(seasonLabel)}`);
  return data?.table ?? [];
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
