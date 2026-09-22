import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Em produção, chamadas para /api/* são redirecionadas ao proxy serverless
// (ver /api/football-proxy.js) para esconder o token da football-data.org
// do bundle público. Em dev, o Vite faz o proxy direto para a API.
//
// IMPORTANTE: process.env NÃO lê o .env automaticamente aqui — é preciso
// usar loadEnv explicitamente, senão o token nunca é enviado à API.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org/v4',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/football/, ''),
          headers: {
            'X-Auth-Token': env.FOOTBALL_DATA_TOKEN || ''
          }
        }
      }
    }
  };
});
