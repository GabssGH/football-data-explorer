import { COMPETITIONS } from '../../api/queries';
import { getSeasonOptions } from '../../utils/seasons';
import { stripClubTags } from '../../utils/text';
import './FilterBar.css';

/**
 * Barra de controle do dashboard — competição, temporada, time.
 * Na aba Temporada, mostra Competição e Time (sem Temporada — essa aba
 * trava sempre no ano mais recente). Na aba Histórico do clube, mostra
 * só Competição — Time e Temporada não fazem sentido lá, já que a
 * tabela mostra todos os clubes de uma vez, sem filtrar por temporada.
 * Estado dos filtros vive na página (Dashboard.jsx) e desce por props;
 * cada hook de dados reage às mudanças automaticamente via React Query.
 */
export function FilterBar({ filters, onChange, teams = [], isLoadingTeams = false, activeTab }) {
  const seasonOptions = getSeasonOptions(filters.competition);
  const showSeasonSelect = false; // nenhuma aba usa mais esse seletor
  const showTeamSelect = activeTab === 'temporada';

  return (
    <div className="filter-bar">
      <label className="filter-bar__field">
        <span>Competição</span>
        <select
          value={filters.competition}
          onChange={(e) => onChange({ ...filters, competition: e.target.value, team: '' })}
        >
          {COMPETITIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      {showSeasonSelect && (
        <label className="filter-bar__field">
          <span>Temporada</span>
          <select
            value={filters.season}
            onChange={(e) => onChange({ ...filters, season: e.target.value })}
          >
            {seasonOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {showTeamSelect && (
        <label className="filter-bar__field">
          <span>Time</span>
          <select
            value={filters.team}
            onChange={(e) => onChange({ ...filters, team: e.target.value })}
            disabled={!teams.length}
          >
            {teams.length === 0 && (
              <option value="">{isLoadingTeams ? 'Carregando times...' : 'Nenhum time disponível'}</option>
            )}
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {stripClubTags(t.name)}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
