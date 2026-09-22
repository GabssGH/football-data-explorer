import { useQuery } from '@tanstack/react-query';
import { getTeamMatches } from '../api/queries';

export function useTeamMatches(teamId, season) {
  return useQuery({
    queryKey: ['teamMatches', teamId, season],
    queryFn: () => getTeamMatches(teamId, season),
    enabled: Boolean(teamId),
    staleTime: 5 * 60_000,
  });
}

/** Agrupa partidas de um time em vitórias/empates/derrotas e gols pró/contra. */
export function summarizeMatches(matches, teamId) {
  return matches.reduce(
    (acc, match) => {
      if (match.status !== 'FINISHED') return acc;
      const isHome = match.homeTeam.id === teamId;
      const goalsFor = isHome ? match.score.fullTime.home : match.score.fullTime.away;
      const goalsAgainst = isHome ? match.score.fullTime.away : match.score.fullTime.home;

      acc.goalsFor += goalsFor;
      acc.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) acc.wins += 1;
      else if (goalsFor === goalsAgainst) acc.draws += 1;
      else acc.losses += 1;

      return acc;
    },
    { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
  );
}
