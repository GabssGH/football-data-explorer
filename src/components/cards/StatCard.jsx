import './StatCard.css';

/**
 * Card estilo placar de estádio: número grande em condensada + uma
 * barra de preenchimento fina embaixo (usada pro aproveitamento, mas
 * serve como indicador visual em qualquer stat com um teto conhecido).
 */
export function StatCard({ label, value, suffix = '', percent, tone = 'gold' }) {
  return (
    <div className="stat-card" data-tone={tone}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value tabular">
        {value}
        {suffix && <span className="stat-card__suffix">{suffix}</span>}
      </span>
      {typeof percent === 'number' && (
        <div className="stat-card__bar-track" role="img" aria-label={`${percent}%`}>
          <div className="stat-card__bar-fill" style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      )}
    </div>
  );
}
