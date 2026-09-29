import { mkdir, writeFile } from 'node:fs/promises';

const TOKEN = process.env.FOOTBALL_DATA_TOKEN;
const BASE = 'https://api.football-data.org/v4';
const OUT = 'public/data';

if (!TOKEN) {
  console.error('FOOTBALL_DATA_TOKEN não definido');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// endpoint da API -> nome do arquivo gerado
const jobs = [
  ['/competitions/BSA', 'competition.json'],
  ['/competitions/BSA/teams', 'teams.json'],
  ['/competitions/BSA/standings', 'standings.json'],
  ['/competitions/BSA/matches', 'matches.json'],
];

await mkdir(OUT, { recursive: true });

for (const [path, file] of jobs) {
  const res = await fetch(BASE + path, { headers: { 'X-Auth-Token': TOKEN } });
  if (!res.ok) {
    console.error(`Falha em ${path}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  await writeFile(`${OUT}/${file}`, JSON.stringify(await res.json()));
  console.log(`OK ${path} -> ${file}`);
  await sleep(7000); // plano gratuito: ~10 requisições por minuto
}