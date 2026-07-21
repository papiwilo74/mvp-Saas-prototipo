export function EmptyState({ title, description, action, isLoading = false, isError = false, errorMessage = '' }) {
  if (isLoading) {
    return (
      <div className="glass-panel p-8 text-center">
        <div className="mx-auto h-8 w-48 animate-pulse rounded-full bg-stone-200" />
        <div className="mx-auto mt-4 h-4 w-64 animate-pulse rounded bg-stone-200" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-panel p-8 text-center">
        <span className="badge-chip bg-red-50 text-red-700 border-red-200">Error</span>
        <h2 className="mt-4 text-2xl font-black tracking-tight">Algo salio mal</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">{errorMessage || 'No pudimos cargar los datos.'}</p>
        {action && <div className="mt-5">{action}</div>}
      </div>
    );
  }

  return (
    <div className="glass-panel p-8 text-center">
      <span className="badge-chip">Listo para empezar</span>
      <h2 className="mt-4 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

