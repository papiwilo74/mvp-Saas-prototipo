import { Skeleton } from './Skeleton';

export function StatCard({ label, value, sub, trend, icon: Icon, color = 'stone', loading }) {
  const colorMap = {
    stone: 'bg-stone-100 text-stone-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  if (loading) {
    return (
      <div className="admin-stat">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
        <Skeleton className="mt-2 h-7 w-20" />
        <Skeleton className="mt-1 h-3 w-16" />
      </div>
    );
  }

  return (
    <div className="admin-stat">
      <div className="flex items-center justify-between">
        <span className="admin-stat-label">{label}</span>
        {Icon && (
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${colorMap[color]}`}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <span className="admin-stat-value">{value}</span>
      {sub && <span className="text-xs font-semibold text-stone-500">{sub}</span>}
      {trend !== undefined && (
        <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}
