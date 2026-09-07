import "./DashboardCard.css";

function DashboardCard({ title, value, icon }) {
  return (
    <div className="dashboard-card">
      <div className="card-icon">{icon}</div>

      <div>
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>
    </div>
  );
}

export default DashboardCard;