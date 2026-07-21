export function DataTable({ columns, data, emptyMessage = 'No hay datos disponibles' }) {
  if (!data.length) {
    return (
      <div className="admin-card text-center">
        <p className="py-8 text-sm text-stone-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-x-auto p-0">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i}>
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
