const FILES = {
  '/competitions/BSA': 'competition.json',
  '/competitions/BSA/teams': 'teams.json',
  '/competitions/BSA/standings': 'standings.json',
  '/competitions/BSA/matches': 'matches.json',
};

export async function apiGet(path) {
  const url = import.meta.env.PROD
    ? `${import.meta.env.BASE_URL}data/${FILES[path]}`
    : `/api/football${path}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} em ${url}`);
  return res.json();
}
const toFile = (path) =>
  path.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '_') + '.json';

export async function apiGet(path) {
  const url = import.meta.env.PROD
    ? `${import.meta.env.BASE_URL}data/${toFile(path)}`
    : `/api/football${path}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro ${res.status} em ${url}`);
  return res.json();
}