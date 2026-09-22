# Football Data Explorer

Dashboard interativo que transforma dados reais de futebol (football-data.org)
em gráficos, indicadores e filtros exploráveis — não uma página estática.

## Stack

- **React 18** + **Vite**
- **@tanstack/react-query** — cache e sincronização de dados assíncronos
- **Recharts** — gráficos
- **football-data.org (v4)** — fonte de dados dinâmicos (jogos, classificação, artilheiros)
- **JSON estático próprio** (`src/data/titles.json`) — histórico de títulos, dado que a API não fornece

## Estrutura

```
src/
├── api/
│   ├── footballDataClient.js   # fetch com cache + fila (respeita 10 req/min do free tier)
│   ├── queries.js               # endpoints organizados por recurso (football-data.org)
│   ├── theSportsDbClient.js     # fetch + resolução de liga por nome (histórico multi-temporada)
│   └── theSportsDbCompetitions.js  # mapeamento código de competição -> nome/temporada TheSportsDB
├── data/
│   └── titles.json              # dataset curado de campeões por temporada (apiSeason + label)
├── hooks/
│   ├── useStandings.js          # classificação + cálculo de aproveitamento
│   ├── useScorers.js            # artilheiros
│   ├── useTeamMatches.js        # partidas de um time (para desempenho por temporada)
│   ├── useTitles.js             # lê titles.json — total de títulos, títulos por time, campeão da temporada
│   └── useCompetitionHistory.js  # histórico completo (títulos/V-E-D/gols) de TODOS os clubes atuais da competição (TheSportsDB)
├── components/
│   ├── layout/FilterBar.jsx     # filtros: competição, temporada (lista), time
│   ├── layout/Tabs.jsx          # abas: Temporada / Histórico do clube
│   ├── cards/StatCard.jsx       # indicador estilo placar de estádio (elemento-assinatura)
│   ├── cards/ScorersTable.jsx   # tabela de artilheiros
│   └── charts/SeasonPerformanceChart.jsx  # V/E/D por temporada
├── pages/
│   └── Dashboard.jsx            # tela principal — aba Temporada (stats + campeão do ano)
│                                  e aba Histórico do clube (total de títulos + linha do tempo)
├── utils/
│   ├── text.js                   # comparação tolerante de nomes (API usa nome oficial, dataset usa nome popular)
│   └── seasons.js                # geração da lista de temporadas selecionáveis
└── styles/
    ├── tokens.css                # paleta, tipografia, espaçamento (design system do projeto)
    └── global.css
```

## Rodando localmente

```bash
npm install
cp .env.example .env   # cole seu token gratuito da football-data.org
npm run dev
```

O token nunca deve ir para o bundle do front. Em dev, o Vite faz proxy
(`vite.config.js`) injetando o header `X-Auth-Token` no servidor. Em produção,
substitua isso por uma função serverless (Vercel/Netlify Function) que faça
o mesmo — nunca chame `api.football-data.org` diretamente do navegador com
o token exposto.

## Fontes de dados

| Dado | Fonte | Por quê |
|---|---|---|
| Classificação, V/E/D, gols, pontos e aproveitamento — só a temporada atual (aba Temporada) | football-data.org | Tabela completa (~20 times), sem limite. A aba trava na temporada mais recente por escolha do usuário — não navega mais temporadas passadas |
| Lista dos ~20 times atuais da competição (aba Histórico) | football-data.org | Tabela completa, sem limite |
| Artilheiros da temporada | football-data.org | Sem alternativa gratuita boa pra "artilheiros por temporada" na TheSportsDB — por isso continua aqui, com a mesma trava de temporada atual |
| Histórico de cada time desde a fundação da competição (aba Histórico) | TheSportsDB | Mesmo limite de 5 times por chamada de temporada passada — na prática, só uma parte dos ~20 times acumula histórico consistente sem plano pago; os demais aparecem com 0 (ver seção abaixo) |
| Títulos históricos por competição (curadoria manual) | `titles.json` | Complementa o histórico automático da TheSportsDB. O app hoje só oferece competições de pontos corridos (Champions League, Copa do Mundo e Eurocopa foram removidas da lista por escolha do usuário), mas o dataset ainda guarda os dados dessas três |

### Cobertura histórica do `titles.json`

| Competição | Desde | Observação |
|---|---|---|
| Premier League | 1992/93 | Fundação da Premier League |
| La Liga | 1929/30 | Fundação da competição |
| Bundesliga | 1963/64 | Fundação da Bundesliga |
| Brasileirão | 1971 + 1937 | 1937 reconhecida pela CBF como 1ª edição em 2023 |
| Serie A, Ligue 1, Eredivisie, Primeira Liga | 1980/81 | Confiabilidade da curadoria manual cai bastante antes disso pra essas quatro — preferimos não incluir dado sem confiança razoável |

Esse dataset foi montado com pesquisa e conhecimento geral verificável, não com acesso a uma
fonte primária linha a linha — pra décadas mais antigas (principalmente pré-1990), há mais
chance de algum erro pontual do que nos anos recentes. Se notar algo errado, é só corrigir
direto em `src/data/titles.json`.

### Estatísticas completas de competições específicas (dataset fixo)

Pra algumas competições, a aba Histórico do clube usa um dataset **estático**, fornecido
diretamente pelo usuário, em vez do cálculo dinâmico via TheSportsDB — porque nenhuma API
gratuita entrega histórico completo (temporadas, títulos, V/E/D, gols) antes de 2000 com
confiabilidade (ver seção abaixo sobre o limite de 5 times). As outras competições continuam
com o cálculo dinâmico via TheSportsDB, com a limitação de dados parciais já documentada.

- **Brasileirão** (`src/data/bsaAllTimeStats.js`) — **159 clubes**: todos que já disputaram a
  competição, não só os que jogam atualmente (única competição do projeto com esse escopo
  completo — as demais cobrem só os clubes atuais). Inclui número de temporadas disputadas.
  Dois campeões pouco lembrados apareceram nessa expansão: Sport (1987) e Guarani (1978). A
  era contínua do Brasileirão (1971 em diante) está 100% coberta no `titles.json`, sem nenhuma
  lacuna; só faltam anos entre 1938 e 1958 (período pré-unificação nacional, fora do escopo
  dos dados fornecidos).
- **Premier League** (`src/data/plAllTimeStats.js`) — **51 clubes**: todos que já disputaram a
  competição, não só os atuais. Agora com número de temporadas disputadas (não tinha antes).
  Dataset perfeito: zero conflitos e zero divergências de contagem — os 34 títulos batem
  exatamente com as 34 temporadas já disputadas. A competição está **100% coberta no
  `titles.json`**, sem nenhuma lacuna, desde a fundação em 1992/93.
- **La Liga** (`src/data/pdAllTimeStats.js`) — **63 clubes**: todos que já disputaram a
  competição, não só os atuais. "Athletic Club" é o nome oficial do Athletic Bilbao. Zero
  conflitos e zero divergências de contagem nessa lista completa — inclusive a lacuna de
  1982/83, que tinha ficado em aberto antes, foi preenchida pelo próprio Athletic Club. A
  competição está **100% coberta no `titles.json`**, sem nenhuma lacuna, desde 1928/29
  (descontando 1936-1939, sem edições por causa da Guerra Civil Espanhola). Os dois conflitos
  resolvidos anteriormente com pesquisa independente (2020/21 com o Atlético de Madrid, não
  Barcelona; 1943/44 com o Valencia, não o Athletic Bilbao) continuam valendo — essa nova lista
  não trouxe esses anos de volta pros clubes errados.
- **Ligue 1** (`src/data/fl1AllTimeStats.js`) — **75 clubes**: todos que já disputaram a
  competição, não só os atuais. Nenhum conflito de ano e nenhuma divergência de contagem — o
  dataset mais limpo recebido até agora. A competição está **100% coberta no `titles.json`**
  desde 1932/33, sem nenhuma lacuna (descontando 1939-1945, quando não houve edições por causa
  da 2ª Guerra). Confirmou-se o 14º título do PSG (2025/26), que antes estava pendente.
  `Toulouse FC` e `Toulouse FC (1937–1967)` aparecem como entradas distintas — o clube atual e
  a versão histórica extinta. A nota do escândalo VA-OM (1992/93, Marseille rebaixado, título
  não atribuído) foi mantida.
- **Eredivisie** (`src/data/dedAllTimeStats.js`) — **55 clubes**: todos que já disputaram a
  competição, não só os atuais. Mesmo conflito de antes reapareceu (Ajax e PSV disputando
  1989/90) e foi resolvido do mesmo jeito, com o Ajax. Os clubes históricos DOS (1957/58) e
  DWS (1963/64) preencheram exatamente as duas lacunas que tinham sobrado antes — a Eredivisie
  agora está **100% coberta no `titles.json`**, sem nenhuma lacuna, desde 1956/57. O usuário
  informou 27 títulos pro PSV, mas 3 deles (1928/29, 1934/35, 1950/51) são de antes da
  fundação da Eredivisie — pertencem ao campeonato holandês amador anterior, uma competição
  diferente. Dentro do escopo da Eredivisie (1956 em diante), o PSV tem **24 títulos
  confirmados**, e o card de estatísticas foi ajustado pra refletir isso. A nota histórica da
  temporada 2019/20 (encerrada sem campeão por causa da pandemia) foi mantida.
- **Primeira Liga** (`src/data/pplAllTimeStats.js`) — **56 clubes**: todos que já disputaram a
  competição, não só os atuais. Conflitos resolvidos com pesquisa (Benfica/Porto/Sporting
  reivindicavam os mesmos anos em 1934/35, 1935/36, 1937/38 e 2019/20): 1934/35 e 2019/20
  ficaram com o Porto, 1935/36 e 1937/38 com o Benfica (inclusive o tricampeonato
  1935/36-1937/38 é um fato bem documentado). Benfica fechou em **38 títulos confirmados** e
  Porto em **31**, ambos batendo exatamente com o que o usuário informou. Sporting ficou em
  **20 confirmados** (usuário informou 21 — falta 1 ano). Uma entrada de 2012/13 pro Porto foi
  descartada por contradizer uma fonte independente confirmando 31 como o total correto do
  Porto — essa temporada voltou a ficar sem campeão confirmado. Belenenses (1945/46) e Boavista
  (2000/01) mantidos mesmo não estando entre os clubes atuais. 2 temporadas (2012/13 e mais 1
  a confirmar do Sporting) seguem em aberto.
- **EFL Championship** (`src/data/elcAllTimeStats.js`) — **58 clubes**: todos que já disputaram
  a competição com esse nome (desde 2004/05), não só os 24 que jogam atualmente. As 22
  temporadas desde a fundação estão **100% cobertas no `titles.json`**, sem nenhuma lacuna —
  a melhor cobertura entre todos os datasets do projeto.
- **Bundesliga** (`src/data/bl1AllTimeStats.js`) — **58 clubes**: todos que já disputaram a
  competição, não só os atuais. Os clubes históricos Eintracht Braunschweig (1966/67), 1860
  München (1965/66), Nürnberg (1967/68) e Kaiserslautern (1990/91 e 1997/98) preencheram
  exatamente as 5 lacunas que tinham sobrado antes — a Bundesliga agora está **100% coberta no
  `titles.json`**, sem nenhuma lacuna, desde 1963/64. O usuário informou 35 títulos pro Bayern
  München, mas listou só 34 anos; como todas as 63 temporadas já têm campeão confirmado
  (nenhuma sobra pra um 35º), ajustei o card de estatísticas pra 34, consistente com o
  calendário completo.

- **Serie A** (`src/data/saAllTimeStats.js`) — **66 clubes**: todos que já disputaram a
  competição, não só os atuais. Zero conflitos e zero divergências de contagem. 121 entradas
  no `titles.json`, cobrindo desde 1897/98 (incluindo os campeões da era pré-Serie A, como
  Genoa e Pro Vercelli); só 2 lacunas (1913/14 e 1926/27), de clubes fora da lista fornecida.
  A nota histórica do Calciopoli (2004/05, título revogado) foi mantida. **Nota sobre o
  Torino**: a linha original veio com um ano ilegível ("1976?"); 1948/49 foi inferido e depois
  confirmado pelo usuário — os 7 títulos são 1927/28, 1942/43, 1945/46, 1946/47, 1947/48,
  1948/49 e 1975/76.

**Todas as 9 competições do projeto agora têm dataset fixo.** O cálculo dinâmico via TheSportsDB
(`useCompetitionHistory`) ficou inativo na prática — é mantido só como fallback caso uma nova
competição seja adicionada sem dataset próprio, e o hook é desativado (recebe `null`) sempre que
há dataset fixo, pra não gastar requisições à toa.

Pra atualizar esses números no futuro ou adicionar outra competição, edite o arquivo
correspondente e registre a competição em `STATIC_HISTORY` (`src/pages/Dashboard.jsx`).

### Limite de 5 times da TheSportsDB (contexto histórico, hoje sem efeito prático)

O endpoint `lookuptable.php` da TheSportsDB devolve, **no plano gratuito**, no máximo 5 times
por chamada — é uma trava documentada da própria API (o plano Premium, US$9/mês, sobe isso pra
100). Isso foi um problema real enquanto o projeto usava dados dinâmicos, mas duas mudanças
posteriores tornaram essa limitação irrelevante na prática:

1. **Aba Temporada** agora trava sempre na temporada mais recente (ver seção acima) — nunca
   mais consulta temporadas passadas, então nunca mais cai no fallback da TheSportsDB.
2. **Aba Histórico do clube** hoje usa datasets fixos pra todas as 9 competições (ver seção
   "Estatísticas completas por competição" acima) — o hook dinâmico via TheSportsDB
   (`useCompetitionHistory`) ficou inativo, mantido só como fallback caso uma competição nova
   seja adicionada sem dataset próprio.

Deixamos essa seção como registro histórico do porquê certas decisões de arquitetura foram
tomadas — não porque a limitação ainda afete o app hoje.

### Alcance da busca na aba Histórico do clube

Essa aba busca o histórico de **todos os clubes que disputam a competição hoje** (não só um),
até o ano de **fundação real** dela (`CLUB_HISTORY_START_YEARS` em
`src/api/theSportsDbCompetitions.js`) — diferente do `titles.json`, que para em 1980 pra quatro
competições por falta de confiança na curadoria; aqui é só uma questão de o dado existir na
fonte. Pra competições antigas (La Liga desde 1929, por exemplo), isso significa buscar quase
100 temporadas: as requisições são feitas em lotes de 8 com pausa de 15s entre eles, pra não
estourar o limite da chave gratuita compartilhada — o primeiro carregamento de uma competição
assim pode levar alguns minutos. Depois de carregado, fica em cache por 30 minutos. Times que
saíram da competição ao longo do tempo (rebaixados e nunca mais voltaram) não entram na tabela,
já que o critério é "quem disputa a competição hoje".

A integração com a TheSportsDB usa a chave de teste pública `"3"` por padrão
(sem cadastro, sem custo). Se quiser uma chave pessoal — que costuma ter um
limite de requisições bem mais folgado — é preciso apoiar o
[Patreon deles](https://www.patreon.com/thesportsdb) (a partir de US$1/mês);
não existe mais cadastro gratuito de chave pessoal. Se você fizer isso,
defina `VITE_THESPORTSDB_KEY=sua_chave` no `.env` e o projeto passa a usá-la
automaticamente — nenhuma outra mudança de código é necessária. A resolução
de liga é feita por nome (`resolveLeagueId` em `src/api/theSportsDbClient.js`),
não por ID fixo — mais robusto a mudanças, mas depende do nome em
`TSDB_LEAGUE_NAMES` bater com o cadastro da TheSportsDB.

## Limitação conhecida da fonte de dados principal

O plano gratuito da football-data.org normalmente só dá acesso à **temporada
atual** de cada competição — pedir uma temporada anterior (ex: `?season=2022`)
costuma retornar `403`, mesmo com um token válido. Isso não é um bug do
projeto: é a política do plano gratuito. A interface já avisa sobre isso no
filtro de temporada, e o erro exibido no dashboard mostra a mensagem exata
que a API devolveu.

Se no futuro fizer sentido ter histórico de verdade (múltiplas temporadas
via API), a alternativa é um plano pago da football-data.org ou trocar a
fonte de dados históricos por outra API (ver comparação que fizemos ao
planejar o projeto). Por enquanto, o histórico de títulos continua vindo do
dataset estático (`titles.json`), que não depende da API.

## Próximos passos sugeridos

1. Gráfico de linha (posição/pontos ao longo dos anos) usando os dados que
   `useCompetitionHistory` já traz — hoje é só tabela.
2. A busca de histórico dispara até ~26 chamadas em paralelo pra TheSportsDB
   (2000 até hoje) — funciona com a chave de teste pública, mas numa chave
   pessoal (ou em produção com mais uso) vale trocar por um pequeno atraso
   entre lotes de requisições, pra não estourar limite.
3. Expandir `titles.json` com mais competições/temporadas.
4. Criar a função serverless de proxy para produção (não incluída aqui —
   depende de onde o projeto será hospedado: Vercel, Netlify etc.).
5. Tela de comparação entre dois times lado a lado.
6. Alternância de tema não é o foco aqui (diferente do Lumora) — o dashboard
   já nasce num tema único e proposital (placar noturno).
