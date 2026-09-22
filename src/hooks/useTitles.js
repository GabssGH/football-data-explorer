import titlesData from '../data/titles.json';
import { namesMatch } from '../utils/text';

/** Histórico de campeões de uma competição, mais recente primeiro. */
export function useTitles(competitionCode) {
  return titlesData[competitionCode] ?? [];
}

/** Quantas vezes um time específico aparece como campeão (comparação tolerante a nome oficial vs. popular). */
export function countTitlesForTeam(competitionCode, teamName) {
  const seasons = titlesData[competitionCode] ?? [];
  return seasons.filter((s) => namesMatch(s.champion, teamName)).length;
}

/** Todas as temporadas em que um time específico foi campeão. */
export function getTitlesWonByTeam(competitionCode, teamName) {
  const seasons = titlesData[competitionCode] ?? [];
  return seasons.filter((s) => namesMatch(s.champion, teamName));
}

/** Quem foi campeão numa temporada (apiSeason) específica, se conhecido. */
export function getTitleForSeason(competitionCode, apiSeason) {
  const seasons = titlesData[competitionCode] ?? [];
  return seasons.find((s) => String(s.apiSeason) === String(apiSeason)) ?? null;
}
