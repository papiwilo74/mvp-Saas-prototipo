export function StatCard({ label, value, trend, icon: Icon, color = 'stone' }) {
  const colorMap = {
    stone: 'bg-stone-100 text-stone-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

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
      {trend !== undefined && (
        <span className={`text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  );
}
