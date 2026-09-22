import './ScorersTable.css';

/** Espera `scorers` no formato retornado por /competitions/{code}/scorers */
export function ScorersTable({ scorers = [] }) {
  return (
    <table className="scorers-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Jogador</th>
          <th>Time</th>
          <th className="tabular">Gols</th>
        </tr>
      </thead>
      <tbody>
        {scorers.map((s, i) => (
          <tr key={s.player.id}>
            <td className="tabular">{i + 1}</td>
            <td>{s.player.name}</td>
            <td>{s.team.name}</td>
            <td className="tabular scorers-table__goals">{s.goals}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
