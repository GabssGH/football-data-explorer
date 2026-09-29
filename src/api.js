import { apiGet } from './api';
const toFile = (path) =>
  path.replace(/^\//, '').replace(/[^a-zA-Z0-9]+/g, '_') + '.json';

export async function apiGet(path) {
  const url = import.meta.env.PROD
    ? `${import.meta.env.BASE_URL}data/${toFile(path)}`
    : `/api/football${path}`;

  const res = await apiGet(url);
  if (!res.ok) throw new Error(`Erro ${res.status} em ${url}`);
  return res.json();
}