/**
 * A API retorna nomes oficiais completos ("SE Palmeiras", "Botafogo FR",
 * "Manchester City FC"), mas o dataset curado de títulos e a TheSportsDB
 * costumam usar nomes populares/abreviados ("Palmeiras", "Botafogo",
 * "Man City"). Comparação exata (===) falha nesses casos — por isso
 * normalizamos e comparamos em duas etapas: inclusão de substring
 * primeiro (rápido, cobre a maioria dos casos) e, se isso falhar,
 * sobreposição de palavras "significativas" ignorando sufixos de clube
 * comuns (FC, CF, AC, SE etc.), que cobre casos tipo "Man Utd" vs
 * "Manchester United FC".
 */
const CLUB_SUFFIX_WORDS = new Set([
  'fc', 'cf', 'ac', 'sc', 'se', 'ec', 'afc', 'cd', 'ud', 'rc', 'as',
  'de', 'do', 'da', 'club', 'clube', 'futebol', 'football', 'calcio',
]);

export function normalizeName(str = '') {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .toLowerCase()
    .trim();
}

function significantWords(str) {
  return normalizeName(str)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !CLUB_SUFFIX_WORDS.has(w));
}

export function namesMatch(a, b) {
  if (!a || !b) return false;
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na.includes(nb) || nb.includes(na)) return true;

  // Fallback: todas as palavras "significativas" do nome mais curto
  // precisam aparecer no mais longo — ex: "Botafogo" (1 palavra) bate em
  // "Botafogo de Futebol e Regatas". Exigir só UMA palavra em comum seria
  // perigoso: "Real Madrid" e "Real Sociedad" compartilham "real" sem
  // serem o mesmo time.
  const wordsA = significantWords(a);
  const wordsB = significantWords(b);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const [shorter, longer] = wordsA.length <= wordsB.length ? [wordsA, wordsB] : [wordsB, wordsA];
  return shorter.every((w) => longer.includes(w));
}

/**
 * Remove siglas/abreviações de nomes de clube pra exibição (não usar
 * pra matching — isso continua sendo trabalho do namesMatch acima).
 * Lista definida pelo usuário. Remove só como palavra inteira
 * (case-insensitive), em qualquer posição do nome, e limpa espaços
 * sobrando depois.
 */
const CLUB_TAGS_TO_STRIP = [
  'FC', 'CF', 'Club', 'RCD', 'RC', 'CA', 'UD', 'SC', 'FVS', 'RB', 'SV', 'VFB', 'VFL',
  'TSG', 'SSC', 'BC', 'AS', 'AC', 'CFC', 'US', 'OGC', 'OSC', 'AJ', 'SCO', 'HSC', 'AFC',
  'PEC', 'NAC', 'RKC', 'CD', 'GD', 'SE', 'FR', 'AF', 'FBPA', 'CR',
];

const CLUB_TAGS_REGEX = new RegExp(`\\b(${CLUB_TAGS_TO_STRIP.join('|')})\\b`, 'gi');

export function stripClubTags(name = '') {
  return name
    .replace(CLUB_TAGS_REGEX, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
