import { useQuery } from '@tanstack/react-query';
import { getCompetitionScorers } from '../api/queries';

export function useScorers(competitionCode, season, limit = 10) {
  return useQuery({
    queryKey: ['scorers', competitionCode, season, limit],
    queryFn: () => getCompetitionScorers(competitionCode, season, limit),
    enabled: Boolean(competitionCode),
    staleTime: 5 * 60_000,
  });
}
