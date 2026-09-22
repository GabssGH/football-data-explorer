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

/** Gols marcados x sofridos na temporada. Espera `data`: [{ label, goalsFor, goalsAgainst }] */
export function GoalsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
        <XAxis type="number" stroke="var(--color-text-muted)" fontSize={13} />
        <YAxis type="category" dataKey="label" stroke="var(--color-text-muted)" fontSize={13} width={140} />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            color: 'var(--color-text)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 13, color: 'var(--color-text-muted)' }} />
        <Bar dataKey="goalsFor" name="Gols marcados" fill="var(--color-gold)" radius={[0, 4, 4, 0]} />
        <Bar dataKey="goalsAgainst" name="Gols sofridos" fill="var(--color-red)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
