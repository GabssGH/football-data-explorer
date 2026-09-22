import { SEASON_CROSSING_COMPETITIONS_SET } from '../utils/seasons';

/**
 * ID de liga da TheSportsDB para cada código de competição da
 * football-data.org. IDs fixos e confirmados diretamente na fonte,
 * em vez de resolvidos por nome em tempo de execução — o endpoint de
 * busca por nome (all_leagues.php) tem limite de 10 resultados na
 * chave gratuita, e como a TheSportsDB tem mais de 1500 ligas
 * cadastradas, a busca por nome praticamente nunca encontrava a liga
 * certa. IDs fixos eliminam esse problema por completo.
 */
export const TSDB_LEAGUE_IDS = {
  PL: '4328',
  PD: '4335',
  BL1: '4331',
  SA: '4332',
  FL1: '4334',
  DED: '4337',
  PPL: '4344',
  ELC: '4329',
  BSA: '4351',
  CL: '4480',
  WC: '4429',
  EC: '4502',
};

/**
 * Ano de fundação de cada competição — usado como limite de quão longe
 * a aba Histórico do clube tenta buscar. É uma pergunta de disponibilidade
 * de dado na fonte, não de confiança de curadoria (diferente do
 * titles.json, que para em 1980 pra SA/FL1/DED/PPL por outro motivo).
 */
export const CLUB_HISTORY_START_YEARS = {
  PL: 1992,
  PD: 1929,
  BL1: 1963,
  SA: 1929,
  FL1: 1932,
  DED: 1956,
  PPL: 1934,
  ELC: 1992,
  BSA: 1971,
  CL: 1955,
  WC: 1930,
  EC: 1960,
};

/** A TheSportsDB usa "2020-2021" para temporadas que cruzam o ano, ou "2024" para ano único. */
export function formatTsdbSeason(competitionCode, year) {
  if (SEASON_CROSSING_COMPETITIONS_SET.has(competitionCode)) {
    return `${year}-${year + 1}`;
  }
  return String(year);
}
