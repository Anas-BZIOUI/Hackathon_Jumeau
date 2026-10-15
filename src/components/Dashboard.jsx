export default function Dashboard({ rooms, graph, t }) {
  const byLevel = {};
  for (const r of rooms) byLevel[r.level] = (byLevel[r.level] || 0) + 1;
  const verified = rooms.filter((r) => r.verified_on_site).length;
  const reliable = rooms.filter((r) => r.reliable).length;
  const missingNum = rooms.filter((r) => !r.number).length;
  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  return (
    <div className="dashboard">
      <p className="hint">{t.qualityIntro}</p>
      <div className="stats">
        <div className="stat"><b>{rooms.length}</b>{t.rooms}</div>
        <div className="stat"><b>{verified}</b>{t.verified}</div>
        <div className="stat"><b>{reliable}</b>{t.reliable}</div>
        <div className="stat"><b>{graph.nodes.length}</b>{t.graphReach}</div>
        <div className="stat"><b>{missingNum}</b>{t.missing}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>id</th>
            <th>{t.floors}</th>
            <th>{t.planM2}</th>
            <th>{t.contourM2}</th>
            <th>{t.reliability}</th>
            <th>{t.verified}</th>
          </tr>
        </thead>
        <tbody>
          {rooms.slice(0, 80).map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.level}</td>
              <td>{r.area_plan_m2 ?? '—'}</td>
              <td>{r.area_contour_m2 ?? '—'}</td>
              <td>{r.contour_quality}</td>
              <td>{r.verified_on_site ? 'oui' : 'non'}{nodeIds.has(r.id) ? '' : ' · ∅'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
