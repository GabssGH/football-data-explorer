import { useQuery } from '@tanstack/react-query';
import { getCompetitionStandings } from '../api/queries';
import { getSeasonTable, sleep } from '../api/theSportsDbClient';
import { TSDB_LEAGUE_IDS, CLUB_HISTORY_START_YEARS, formatTsdbSeason } from '../api/theSportsDbCompetitions';
import { namesMatch, normalizeName } from '../utils/text';

const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 15_000; // respeita o limite de ~30 req/min da chave gratuita compartilhada

/**
 * Histórico de todos os times que disputam a competição hoje, desde a
 * fundação dela.
 *
 * A lista dos ~20 times atuais vem da football-data.org (tabela
 * completa, sem limite) — não da TheSportsDB, cujo plano gratuito
 * limita lookuptable.php a só 5 times por chamada. O histórico de cada
 * temporada passada, porém, só pode vir da TheSportsDB (a football-data
 * bloqueia temporadas passadas no plano gratuito) — e aí sim esbarra
 * nesse limite de 5. Na prática: a lista de times é sempre completa,
 * mas só uma parte deles (tipicamente os times de ponta em cada
 * temporada) acumula histórico consistente sem um plano pago da
 * TheSportsDB. Times sem dado aparecem com 0 em tudo, o que é honesto
 * dado o que a fonte gratuita permite.
 */
async function fetchCurrentTeams(competitionCode) {
  const currentYear = new Date().getFullYear();
  for (const year of [currentYear, currentYear - 1]) {
    try {
      const data = await getCompetitionStandings(competitionCode, year);
      const rows = data?.standings?.[0]?.table;
      if (rows && rows.length > 0) {
        return rows.map((r) => ({ key: normalizeName(r.team.name), name: r.team.name }));
      }
    } catch {
      // tenta o ano anterior
    }
  }
  return [];
}

export function useCompetitionHistory(competitionCode) {
  return useQuery({
    queryKey: ['competitionHistory', competitionCode],
    queryFn: async () => {
      const leagueId = TSDB_LEAGUE_IDS[competitionCode];
      const startYear = CLUB_HISTORY_START_YEARS[competitionCode];
      if (!leagueId || !startYear) return { teams: [] };

      const currentTeams = await fetchCurrentTeams(competitionCode);
      if (currentTeams.length === 0) return { teams: [] };

      const aggregates = new Map(
        currentTeams.map((t) => [
          t.key,
          { name: t.name, titles: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, seasons: 0 },
        ])
      );

      const currentYear = new Date().getFullYear();
      const years = [];
      for (let y = currentYear; y >= startYear; y -= 1) years.push(y);

      for (let i = 0; i < years.length; i += BATCH_SIZE) {
        const batch = years.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.allSettled(
          batch.map((year) => getSeasonTable(leagueId, formatTsdbSeason(competitionCode, year)))
        );
        for (const result of batchResults) {
          if (result.status !== 'fulfilled') continue;
          for (const row of result.value) {
            const match = currentTeams.find((t) => namesMatch(t.name, row.strTeam));
            if (!match) continue;
            const agg = aggregates.get(match.key);
            agg.seasons += 1;
            agg.wins += Number(row.intWin) || 0;
            agg.draws += Number(row.intDraw) || 0;
            agg.losses += Number(row.intLoss) || 0;
            agg.goalsFor += Number(row.intGoalsFor) || 0;
            agg.goalsAgainst += Number(row.intGoalsAgainst) || 0;
            if (Number(row.intRank) === 1) agg.titles += 1;
          }
        }
        if (i + BATCH_SIZE < years.length) await sleep(BATCH_DELAY_MS);
      }

      const teams = Array.from(aggregates.values()).sort(
        (a, b) => b.titles - a.titles || b.wins - a.wins
      );

      return { teams, seasonsRequested: years.length };
    },
    enabled: Boolean(competitionCode),
    staleTime: 30 * 60_000,
  });
}
