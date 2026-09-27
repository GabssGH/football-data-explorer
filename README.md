# ⚽ Football Data Explorer

**Um dashboard interativo que transforma dados reais de futebol em gráficos, indicadores e histórico explorável — em vez de uma página estática de estatísticas.**

Construído com React, o projeto cruza dados ao vivo de duas APIs públicas com um banco de dados histórico próprio, cobrindo **9 competições** e mais de **640 clubes**, indo até a fundação de cada liga.

---

## ✨ O que dá pra fazer

- **Explorar a temporada atual** de 9 grandes ligas europeias e do Brasileirão: classificação completa, pontos, vitórias, empates, derrotas, gols e artilheiros, tudo atualizado em tempo real.
- **Navegar o histórico completo de qualquer clube que já disputou cada competição** — não só os times atuais. Títulos, temporadas disputadas, saldo de vitórias/empates/derrotas e gols, desde a fundação da liga.
- **Ordenar o histórico** por qualquer estatística (títulos, vitórias, gols marcados/sofridos etc.) pra comparar clubes rapidamente.
- **Ver o campeão de cada temporada** destacado automaticamente quando o time selecionado foi o vencedor daquele ano.

## 🏆 Competições e cobertura

| Competição | Clubes catalogados | Títulos no histórico | Desde |
|---|---:|---:|---|
| Brasileirão Série A | 159 | 70 | 1937 |
| Ligue 1 (França) | 75 | 88 | 1932 |
| Serie A (Itália) | 66 | 121 | 1897 |
| La Liga (Espanha) | 63 | 95 | 1928 |
| Bundesliga (Alemanha) | 58 | 63 | 1963 |
| EFL Championship (Inglaterra) | 58 | 22 | 2004 |
| Primeira Liga (Portugal) | 56 | 91 | 1934 |
| Eredivisie (Holanda) | 55 | 70 | 1956 |
| Premier League (Inglaterra) | 51 | 34 | 1992 |

A maioria das competições está com **cobertura de 100% das temporadas** desde a fundação — sem
nenhum ano em aberto. Todo esse histórico foi curado e cruzado manualmente (ver seção
[Como os dados funcionam](#-como-os-dados-funcionam)).

## 🖥️ Stack técnica

| Camada | Tecnologia |
|---|---|
| Framework | React 18 + Vite |
| Dados assíncronos / cache | TanStack Query (React Query) |
| Gráficos | Recharts |
| Estilo | CSS puro, com um design system próprio (tokens de cor/tipografia inspirados em placar de estádio) |
| Dados ao vivo | [football-data.org](https://www.football-data.org/) (temporada atual) e [TheSportsDB](https://www.thesportsdb.com/) (apoio) |

## 🧠 Como os dados funcionam

O maior desafio técnico do projeto não foi a interface — foi a camada de dados. Algumas decisões
de arquitetura que valem destacar:

- **Fonte híbrida com fallback automático.** A classificação da temporada atual vem da
  football-data.org (tabela completa, sem limitações). APIs gratuitas de futebol costumam travar
  o acesso a temporadas passadas ou limitar quantos times uma consulta devolve — por isso o
  histórico completo de cada competição usa um **dataset próprio**, montado e validado à mão.
- **Validação cruzada de conflitos.** Ao consolidar títulos históricos de múltiplas fontes, o
  projeto detecta programaticamente quando duas listas reivindicam o mesmo ano pra clubes
  diferentes (algo comum em dados históricos de futebol) e resolve com pesquisa adicional antes
  de gravar.
- **Cache e paginação inteligente.** As chamadas de API são cacheadas e reaproveitadas entre
  componentes via React Query, evitando requisições repetidas desnecessárias.

## 🚀 Rodando localmente

```bash
git clone https://github.com/<seu-usuario>/football-data-explorer.git
cd football-data-explorer
npm install
cp .env.example .env   # cole seu token gratuito da football-data.org (ver abaixo)
npm run dev
```

Token gratuito em [football-data.org/client/register](https://www.football-data.org/client/register) — necessário só pra ver artilheiros e a classificação da temporada atual; todo o histórico funciona sem token.

## 📁 Estrutura do projeto

```
src/
├── api/            # clientes das APIs (football-data.org, TheSportsDB) + cache
├── components/      # UI: filtros, cards, gráficos, tabelas
├── data/            # histórico curado de cada competição (títulos, estatísticas por clube)
├── hooks/           # lógica de busca de dados (React Query)
├── pages/           # tela principal (Dashboard)
└── styles/          # design tokens e estilos globais
```

## 🗺️ Possíveis próximos passos

- Gráfico de evolução de posição/pontos do clube ao longo dos anos
- Tela de comparação entre dois clubes lado a lado
- Completar as poucas lacunas históricas restantes (documentadas em `src/data/titles.json`)

## 👤 Autor

**Gabriel Herrera** — projeto de portfólio, parte da transição de carreira para desenvolvimento
de software.
[LinkedIn](https://www.linkedin.com/in/gabriel-herrera-806bb4367)
