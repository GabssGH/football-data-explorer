import { mkdir, writeFile } from 'node:fs/promises';

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const BASE = 'https://api.football-data.org/v4';
const OUT = 'public/data';

if (!TOKEN) {
  console.error('FOOTBALL_DATA_TOKEN não definido');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const toFile = (path) =>
  path.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '_') + '.json';

// Cada string precisa ser IDÊNTICA à usada no app
const paths = [
  '/competitions/BSA/teams?season=2026',
  '/competitions/BSA/standings?season=2026',
  '/competitions/BSA/matches?season=2026',
  '/competitions/BSA/scorers?limit=10&season=2026',
];

await mkdir(OUT, { recursive: true });

for (const path of paths) {
  const res = await fetch(BASE + path, { headers: { 'X-Auth-Token': TOKEN } });
  if (!res.ok) {
    console.error(`Falha em ${path}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  await writeFile(`${OUT}/${toFile(path)}`, JSON.stringify(await res.json()));
  console.log(`OK ${path} -> ${toFile(path)}`);
  await sleep(7000);
}