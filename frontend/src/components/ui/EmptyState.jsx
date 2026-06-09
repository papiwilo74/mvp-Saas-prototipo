export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-md border border-dashed border-stone-300 bg-white p-8 text-center">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

