import { useQuery } from '@tanstack/react-query';
import { getCompetitionStandings } from '../api/queries';
import { getSeasonTable } from '../api/theSportsDbClient';
import { TSDB_LEAGUE_IDS, formatTsdbSeason } from '../api/theSportsDbCompetitions';

/**
 * Classificação de uma competição/temporada, com fallback entre duas
 * fontes:
 *
 * 1) football-data.org primeiro — só funciona pra temporada ATUAL no
 *    plano gratuito (qualquer outra dá 403), mas quando funciona traz
 *    a tabela completa (~20 times), sem limite.
 * 2) Se isso falhar (qualquer temporada passada), cai pra TheSportsDB
 *    — funciona pra qualquer ano, mas o plano gratuito de lá limita a
 *    resposta a só 5 times por chamada (trava documentada da própria
 *    API, sem contorno possível sem plano pago). Por isso temporadas
 *    passadas mostram só 5 times na lista, enquanto a atual mostra
 *    todos.
 */
function normalizeTsdbRow(row) {
  return {
    team: { id: row.idTeam, name: row.strTeam },
    won: row.intWin != null ? Number(row.intWin) : 0,
    draw: row.intDraw != null ? Number(row.intDraw) : 0,
    lost: row.intLoss != null ? Number(row.intLoss) : 0,
    goalsFor: row.intGoalsFor != null ? Number(row.intGoalsFor) : 0,
    goalsAgainst: row.intGoalsAgainst != null ? Number(row.intGoalsAgainst) : 0,
    playedGames: row.intPlayed != null ? Number(row.intPlayed) : 0,
    points: row.intPoints != null ? Number(row.intPoints) : 0,
  };
}

export function useStandings(competitionCode, season) {
  return useQuery({
    queryKey: ['standings', competitionCode, season],
    queryFn: async () => {
      // football-data.org: já vem no formato que o app espera
      // (team.id, team.name, won, draw, lost, goalsFor, goalsAgainst,
      // playedGames, points) — nenhuma normalização necessária.
      try {
        const fdData = await getCompetitionStandings(competitionCode, season);
        const rows = fdData?.standings?.[0]?.table;
        if (rows && rows.length > 0) return rows;
      } catch {
        // Não é a temporada atual (ou outro erro) — cai pra TheSportsDB abaixo.
      }

      const leagueId = TSDB_LEAGUE_IDS[competitionCode];
      if (!leagueId) return [];
      const seasonLabel = formatTsdbSeason(competitionCode, Number(season));
      const rows = await getSeasonTable(leagueId, seasonLabel);
      return rows.map(normalizeTsdbRow);
    },
    enabled: Boolean(competitionCode && season),
    staleTime: 5 * 60_000,
  });
}

/** Aproveitamento (%) = pontos conquistados / pontos possíveis. */
export function calculateAproveitamento(teamStanding) {
  const { playedGames, points } = teamStanding;
  if (!playedGames) return 0;
  const maxPoints = playedGames * 3;
  return Math.round((points / maxPoints) * 1000) / 10; // 1 casa decimal
}
