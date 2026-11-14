
export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span className="stat-label">{label}</span>

        <div className="stat-icon">
          {Icon && <Icon size={20} strokeWidth={1.8} />}
        </div>
      </div>

      <h3 className="stat-value">{value}</h3>

      <p className="stat-description">{description}</p>
    </div>
  );
}
