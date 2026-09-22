import { useState, useMemo, useEffect } from 'react';
import { FilterBar } from '../components/layout/FilterBar';
import { Tabs } from '../components/layout/Tabs';
import { StatCard } from '../components/cards/StatCard';
import { ScorersTable } from '../components/cards/ScorersTable';
import { SeasonPerformanceChart } from '../components/charts/SeasonPerformanceChart';
import { GoalsChart } from '../components/charts/GoalsChart';
import { useStandings, calculateAproveitamento } from '../hooks/useStandings';
import { useScorers } from '../hooks/useScorers';
import { useTitles, getTitleForSeason } from '../hooks/useTitles';
import { namesMatch, stripClubTags } from '../utils/text';
import { useCompetitionHistory } from '../hooks/useCompetitionHistory';
import { getSeasonOptions } from '../utils/seasons';
import { BSA_ALL_TIME_STATS } from '../data/bsaAllTimeStats'; // 159 clubes — todos que já disputaram o Brasileirão
import { PL_ALL_TIME_STATS } from '../data/plAllTimeStats';
import { PD_ALL_TIME_STATS } from '../data/pdAllTimeStats';
import { FL1_ALL_TIME_STATS } from '../data/fl1AllTimeStats';
import { DED_ALL_TIME_STATS } from '../data/dedAllTimeStats';
import { PPL_ALL_TIME_STATS } from '../data/pplAllTimeStats';
import { ELC_ALL_TIME_STATS } from '../data/elcAllTimeStats';
import { BL1_ALL_TIME_STATS } from '../data/bl1AllTimeStats';
import { SA_ALL_TIME_STATS } from '../data/saAllTimeStats';

const DEFAULT_SEASON = getSeasonOptions('BSA')[0].value;
const INITIAL_FILTERS = { competition: 'BSA', season: DEFAULT_SEASON, team: '' };

/** Ano mais recente disponível pra uma competição — usado pra travar a aba Temporada na atualidade. */
function getCurrentSeason(competitionCode) {
  return getSeasonOptions(competitionCode)[0].value;
}

// Competições com dataset próprio fornecido pelo usuário — hoje, todas.
// Cobre TODOS os clubes que já disputaram cada competição, não só os
// atuais (nenhuma API gratuita entrega esse nível de histórico).
const STATIC_HISTORY = {
  BSA: BSA_ALL_TIME_STATS,
  PL: PL_ALL_TIME_STATS,
  PD: PD_ALL_TIME_STATS,
  FL1: FL1_ALL_TIME_STATS,
  DED: DED_ALL_TIME_STATS,
  PPL: PPL_ALL_TIME_STATS,
  ELC: ELC_ALL_TIME_STATS,
  BL1: BL1_ALL_TIME_STATS,
  SA: SA_ALL_TIME_STATS,
};

const TABS = [
  { id: 'temporada', label: 'Temporada' },
  { id: 'historico', label: 'Histórico do clube' },
];

const SORT_OPTIONS = [
  { key: 'seasons', label: 'Temporadas' },
  { key: 'titles', label: 'Títulos' },
  { key: 'wins', label: 'Vitórias' },
  { key: 'draws', label: 'Empates' },
  { key: 'losses', label: 'Derrotas' },
  { key: 'goalsFor', label: 'Gols marcados' },
  { key: 'goalsAgainst', label: 'Gols sofridos' },
];

export function Dashboard() {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState('temporada');
  const [sortKey, setSortKey] = useState('titles');

  // A aba Temporada trava sempre no ano mais recente disponível — não usa
  // mais filters.season pra nada aqui, pra deixar a interface simples e
  // sempre mostrar a competição em andamento.
  const currentSeason = getCurrentSeason(filters.competition);

  const standingsQuery = useStandings(filters.competition, currentSeason);
  const scorersQuery = useScorers(filters.competition, currentSeason);
  const titles = useTitles(filters.competition);
  // Hoje todas as competições do projeto têm dataset fixo, então esse hook
  // fica inativo na prática — mas é mantido como fallback caso uma nova
  // competição seja adicionada sem dataset próprio. Passar null evita
  // disparar dezenas de requisições inúteis à TheSportsDB a cada troca.
  const hasStaticHistory = Boolean(STATIC_HISTORY[filters.competition]);
  const competitionHistoryQuery = useCompetitionHistory(
    hasStaticHistory ? null : filters.competition
  );

  const table = standingsQuery.data ?? [];
  const teams = useMemo(
    () => table.map((row) => ({ id: row.team.id, name: row.team.name })),
    [table]
  );

  // Sem opção "Todos os times" — sempre há um time selecionado. Assim que a
  // classificação carrega, escolhe o primeiro automaticamente se o filtro
  // ainda estiver vazio ou apontando pra um time que não existe nessa lista
  // (ex: trocou de competição e o ID antigo não bate com nada aqui).
  useEffect(() => {
    if (teams.length === 0) return;
    const stillValid = teams.some((t) => String(t.id) === filters.team);
    if (!stillValid) {
      setFilters((prev) => ({ ...prev, team: String(teams[0].id) }));
    }
  }, [teams]);

  const selectedRow = table.find((row) => String(row.team.id) === filters.team) ?? table[0];
  const seasonChampion = getTitleForSeason(filters.competition, currentSeason);
  const isSelectedTeamChampion =
    selectedRow && seasonChampion && namesMatch(seasonChampion.champion, selectedRow.team.name);

  // V/E/D da temporada selecionada — já vem pronto na própria classificação,
  // não precisa de chamada extra nem de múltiplas temporadas.
  const seasonPerformanceData = selectedRow
    ? [
        {
          season: seasonChampion?.label ?? currentSeason,
          wins: selectedRow.won,
          draws: selectedRow.draw,
          losses: selectedRow.lost,
        },
      ]
    : [];

  const goalsData = selectedRow
    ? [
        {
          label: stripClubTags(selectedRow.team.name),
          goalsFor: selectedRow.goalsFor,
          goalsAgainst: selectedRow.goalsAgainst,
        },
      ]
    : [];

  const standingsError = standingsQuery.isError
    ? `Não foi possível carregar a classificação (${standingsQuery.error.message}).`
    : null;

  const standingsEmpty =
    !standingsQuery.isLoading && !standingsQuery.isError && table.length === 0;

  const isStaticHistory = Boolean(STATIC_HISTORY[filters.competition]);
  const historyTeams = STATIC_HISTORY[filters.competition] ?? competitionHistoryQuery.data?.teams ?? [];

  const sortedHistoryTeams = useMemo(
    () => [...historyTeams].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0)),
    [historyTeams, sortKey]
  );

  return (
    <main className="container" style={{ paddingBlock: 'var(--space-5)' }}>
      <header style={{ marginBottom: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--fs-hero)' }}>Football Data Explorer</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Explore títulos, desempenho e artilheiros com dados reais.
        </p>
      </header>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        teams={teams}
        isLoadingTeams={standingsQuery.isLoading}
        activeTab={activeTab}
      />

      {activeTab === 'temporada' && standingsError && (
        <p
          role="alert"
          style={{
            color: 'var(--color-red)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-red)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-3)',
            marginTop: 'var(--space-3)',
          }}
        >
          {standingsError}
        </p>
      )}

      {activeTab === 'temporada' && standingsEmpty && (
        <p
          role="alert"
          style={{
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-3)',
            marginTop: 'var(--space-3)',
          }}
        >
          Nenhum dado encontrado para essa competição/temporada nessa fonte.
        </p>
      )}

      {activeTab === 'temporada' && standingsQuery.isLoading && (
        <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          Carregando dados da temporada...
        </p>
      )}

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === 'temporada' && (
          <>
            {seasonChampion && (
              <p
                className="tabular"
                style={{
                  marginBottom: 'var(--space-4)',
                  color: isSelectedTeamChampion ? 'var(--color-gold)' : 'var(--color-text-muted)',
                }}
              >
                {isSelectedTeamChampion ? '🏆 ' : ''}
                Campeão da temporada {seasonChampion.label}:{' '}
                <strong>{stripClubTags(seasonChampion.champion)}</strong>
              </p>
            )}

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
              }}
            >
              {selectedRow && (
                <>
                  <StatCard label="Pontos" value={selectedRow.points} tone="gold" />
                  <StatCard label="Vitórias" value={selectedRow.won} tone="green" />
                  <StatCard label="Derrotas" value={selectedRow.lost} tone="red" />
                  <StatCard label="Gols" value={selectedRow.goalsFor} suffix="marcados" />
                  <StatCard
                    label="Aproveitamento"
                    value={calculateAproveitamento(selectedRow)}
                    suffix="%"
                    percent={calculateAproveitamento(selectedRow)}
                  />
                </>
              )}
            </section>

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-5)',
              }}
            >
              <div>
                <h2 style={{ marginBottom: 'var(--space-3)' }}>Vitórias, empates e derrotas</h2>
                {seasonPerformanceData.length > 0 && (
                  <SeasonPerformanceChart data={seasonPerformanceData} />
                )}
              </div>
              <div>
                <h2 style={{ marginBottom: 'var(--space-3)' }}>Gols marcados x sofridos</h2>
                {goalsData.length > 0 && <GoalsChart data={goalsData} />}
              </div>
            </section>

            <section>
              <h2 style={{ marginBottom: 'var(--space-3)' }}>Artilheiros da temporada</h2>
              <ScorersTable scorers={scorersQuery.data?.scorers ?? []} />
            </section>
          </>
        )}

        {activeTab === 'historico' && (
          <>
            <section style={{ marginBottom: 'var(--space-5)' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <h2>
                  Histórico completo de todos os clubes da competição
                  {isStaticHistory ? ' (dados completos)' : ''}
                </h2>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: 'var(--fs-caption)', color: 'var(--color-text-muted)' }}>
                    Ordenar por
                  </span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    style={{
                      background: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 4,
                      padding: 'var(--space-1) var(--space-2)',
                    }}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.key} value={o.key}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {!isStaticHistory && competitionHistoryQuery.isLoading && (
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Carregando histórico completo de todos os clubes (pode levar mais de um
                  minuto em competições com muitas temporadas)...
                </p>
              )}
              {!isStaticHistory && competitionHistoryQuery.isError && (
                <p style={{ color: 'var(--color-red)' }}>
                  Não foi possível carregar o histórico da competição agora.
                </p>
              )}

              {sortedHistoryTeams.length > 0 ? (
                <table className="scorers-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Clube</th>
                      <th className="tabular">Temporadas</th>
                      <th className="tabular">Títulos</th>
                      <th className="tabular">V</th>
                      <th className="tabular">E</th>
                      <th className="tabular">D</th>
                      <th className="tabular">Gols marcados</th>
                      <th className="tabular">Gols sofridos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedHistoryTeams.map((t) => (
                      <tr key={t.name}>
                        <td>{stripClubTags(t.name)}</td>
                        <td className="tabular">{t.seasons ?? '—'}</td>
                        <td className="tabular" style={{ color: t.titles > 0 ? 'var(--color-gold)' : undefined }}>
                          {t.titles > 0 ? `🏆 ${t.titles}` : 0}
                        </td>
                        <td className="tabular">{t.wins}</td>
                        <td className="tabular">{t.draws}</td>
                        <td className="tabular">{t.losses}</td>
                        <td className="tabular">{t.goalsFor}</td>
                        <td className="tabular">{t.goalsAgainst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                !competitionHistoryQuery.isLoading && (
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Sem dados históricos disponíveis para essa competição nessa fonte.
                  </p>
                )
              )}
            </section>

            <section>
              <h2 style={{ marginBottom: 'var(--space-3)' }}>Histórico de títulos da competição</h2>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  gap: 'var(--space-3)',
                  flexWrap: 'wrap',
                  maxHeight: '360px',
                  overflowY: 'auto',
                }}
              >
                {titles.map((t, i) => (
                  <li
                    key={`${t.apiSeason}-${i}`}
                    className="tabular"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-pill)',
                      padding: 'var(--space-1) var(--space-3)',
                      fontSize: 'var(--fs-caption)',
                    }}
                  >
                    {t.label} — <strong style={{ color: 'var(--color-gold)' }}>{stripClubTags(t.champion)}</strong>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
