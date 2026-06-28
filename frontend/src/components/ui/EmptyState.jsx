export function EmptyState({ title, description, action }) {
  return (
    <div className="glass-panel p-8 text-center">
      <span className="badge-chip">Listo para empezar</span>
      <h2 className="mt-4 text-2xl font-black tracking-tight">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

