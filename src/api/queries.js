import { fetchFootballData } from './footballDataClient';

// Competições de pontos corridos do plano gratuito da football-data.org.
// Champions League, Copa do Mundo e Eurocopa (mata-mata/curta duração)
// foram removidas por escolha do usuário — ficam só ligas de temporada
// inteira. Ver: https://www.football-data.org/documentation/api
export const COMPETITIONS = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'ELC', name: 'Championship' },
  { code: 'BSA', name: 'Brasileirão Série A' },
];

// football-data.org: tabela completa (~20 times), mas só funciona pra
// temporada atual no plano gratuito (temporadas passadas dão 403).
export function getCompetitionStandings(competitionCode, season) {
  const q = season ? `?season=${season}` : '';
  return fetchFootballData(`/competitions/${competitionCode}/standings${q}`);
}

// A football-data.org também é usada pra artilheiros (getCompetitionScorers) —
// classificação de temporadas passadas cai pra TheSportsDB (ver useStandings.js),
// já que o plano gratuito daqui só libera a temporada atual pra esses dados.

export function getCompetitionScorers(competitionCode, season, limit = 10) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (season) params.set('season', season);
  return fetchFootballData(`/competitions/${competitionCode}/scorers?${params}`);
}

export function getCompetitionMatches(competitionCode, season) {
  const q = season ? `?season=${season}` : '';
  return fetchFootballData(`/competitions/${competitionCode}/matches${q}`);
}

export function getTeam(teamId) {
  return fetchFootballData(`/teams/${teamId}`);
}

export function getTeamMatches(teamId, season) {
  const q = season ? `?season=${season}` : '';
  return fetchFootballData(`/teams/${teamId}/matches${q}`);
}
