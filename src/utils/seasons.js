/**
 * A API usa um único ano como valor de "season" (ex: 2023 = temporada
 * 2023/24 na Premier League). Competições que atravessam o virada do
 * ano exibem rótulo "2023/24"; competições de ano civil único (como o
 * Brasileirão) exibem só o ano.
 */
export const SEASON_CROSSING_COMPETITIONS_SET = new Set([
  'PL', 'PD', 'BL1', 'SA', 'FL1', 'DED', 'PPL', 'ELC', 'CL',
]);
const SEASON_CROSSING_COMPETITIONS = SEASON_CROSSING_COMPETITIONS_SET;

export function formatSeasonLabel(competitionCode, year) {
  if (SEASON_CROSSING_COMPETITIONS.has(competitionCode)) {
    return `${year}/${String(year + 1).slice(-2)}`;
  }
  return String(year);
}

/** Ano-base da lista de temporadas do filtro (aba Temporada, que fica em 2000 por escolha do usuário). */
export const HISTORY_START_YEAR = 2000;

/**
 * Temporadas oferecidas na lista, de HISTORY_START_YEAR até hoje. IMPORTANTE:
 * o plano gratuito da football-data.org normalmente só dá acesso à
 * temporada atual — temporadas anteriores costumam responder 403 (histórico
 * é recurso pago dessa API específica). A lista vai até 2000 porque é o
 * alcance que a TheSportsDB (usada na aba Histórico do clube) costuma
 * cobrir; a UI avisa sobre essa diferença entre fontes.
 */
export function getSeasonOptions(competitionCode) {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let year = currentYear; year >= HISTORY_START_YEAR; year -= 1) {
    options.push({ value: String(year), label: formatSeasonLabel(competitionCode, year) });
  }
  return options;
}
