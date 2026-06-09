const styles = {
  PENDING: 'bg-amber-100 text-amber-800',
  PREPARING: 'bg-orange-100 text-orange-800',
  ON_THE_WAY: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800'
};

const labels = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  ON_THE_WAY: 'En camino',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] || styles.PENDING}`}>
      {labels[status] || status}
    </span>
  );
}
