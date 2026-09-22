import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

/**
 * Vitórias / empates / derrotas por temporada, empilhado.
 * Espera `data` no formato: [{ season: '2022', wins, draws, losses }, ...]
 */
export function SeasonPerformanceChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis dataKey="season" stroke="var(--color-text-muted)" fontSize={13} />
        <YAxis stroke="var(--color-text-muted)" fontSize={13} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            color: 'var(--color-text)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: 'var(--color-text-muted)' }} />
        <Bar dataKey="wins" name="Vitórias" stackId="a" fill="var(--color-green)" />
        <Bar dataKey="draws" name="Empates" stackId="a" fill="var(--color-blue-mist)" />
        <Bar dataKey="losses" name="Derrotas" stackId="a" fill="var(--color-red)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
