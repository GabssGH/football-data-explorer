import { useQuery } from '@tanstack/react-query';
import { getSeasonTable, sleep } from '../api/theSportsDbClient';
import { TSDB_LEAGUE_IDS, CLUB_HISTORY_START_YEARS, formatTsdbSeason } from '../api/theSportsDbCompetitions';
import { namesMatch } from '../utils/text';

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 15_000; // respeita o limite de ~30 req/min da chave gratuita compartilhada

/**
 * Busca a posição do time em cada temporada de uma competição, desde a
 * fundação dela (CLUB_HISTORY_START_YEARS), via TheSportsDB. Como isso
 * pode significar buscar dezenas ou até quase 100 temporadas (ex: La
 * Liga desde 1929), as requisições são feitas em lotes pequenos com
 * pausa entre eles, em vez de tudo de uma vez — senão a chave gratuita
 * compartilhada seria bloqueada por excesso de uso quase imediatamente.
 * Temporadas já em cache (30 min) respondem na hora, sem contar pro
 * limite. Uma temporada que falhar ou não existir na fonte não derruba
 * as outras — só fica de fora, silenciosamente.
 *
 * Também deriva "títulos" automaticamente: se o time terminou em 1º
 * lugar na tabela final daquela temporada, contamos como título.
 */
export function useClubHistory(competitionCode, teamName) {
  return useQuery({
    queryKey: ['clubHistory', competitionCode, teamName],
    queryFn: async () => {
      const leagueId = TSDB_LEAGUE_IDS[competitionCode];
      const startYear = CLUB_HISTORY_START_YEARS[competitionCode];
      if (!leagueId || !startYear) return { seasons: [], aggregate: null };

      const currentYear = new Date().getFullYear();
      const years = [];
      for (let y = currentYear; y >= startYear; y -= 1) years.push(y);

      const seasons = [];
      for (let i = 0; i < years.length; i += BATCH_SIZE) {
        const batch = years.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map(async (year) => {
            const seasonLabel = formatTsdbSeason(competitionCode, year);
            const table = await getSeasonTable(leagueId, seasonLabel);
            const row = table.find((r) => namesMatch(r.strTeam, teamName));
            if (!row) return null;
            return {
              year,
              seasonLabel,
              rank: row.intRank != null ? Number(row.intRank) : null,
              points: row.intPoints != null ? Number(row.intPoints) : null,
              wins: row.intWin != null ? Number(row.intWin) : 0,
              draws: row.intDraw != null ? Number(row.intDraw) : 0,
              losses: row.intLoss != null ? Number(row.intLoss) : 0,
              goalsFor: row.intGoalsFor != null ? Number(row.intGoalsFor) : 0,
              goalsAgainst: row.intGoalsAgainst != null ? Number(row.intGoalsAgainst) : 0,
              isChampion: Number(row.intRank) === 1,
            };
          })
        );
        for (const r of batchResults) {
          if (r.status === 'fulfilled' && r.value) seasons.push(r.value);
        }
        if (i + BATCH_SIZE < years.length) await sleep(BATCH_DELAY_MS);
      }

      seasons.sort((a, b) => b.year - a.year);

      const aggregate = seasons.reduce(
        (acc, s) => ({
          titles: acc.titles + (s.isChampion ? 1 : 0),
          wins: acc.wins + s.wins,
          draws: acc.draws + s.draws,
          losses: acc.losses + s.losses,
          goalsFor: acc.goalsFor + s.goalsFor,
          goalsAgainst: acc.goalsAgainst + s.goalsAgainst,
          seasonsFound: acc.seasonsFound + 1,
        }),
        { titles: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, seasonsFound: 0 }
      );

      return { seasons, aggregate, seasonsRequested: years.length };
    },
    enabled: Boolean(competitionCode && teamName),
    staleTime: 30 * 60_000,
  });
}
