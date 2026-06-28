export function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <button type="button" className="btn-secondary" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        Anterior
      </button>
      <p className="text-sm font-semibold text-stone-600">
        Pagina {page} de {totalPages}
      </p>
      <button type="button" className="btn-secondary" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Siguiente
      </button>
    </div>
  );
}