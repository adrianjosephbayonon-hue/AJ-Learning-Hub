import "./NotificationCard.css";

function NotificationCard({ title, description, time }) {
  return (
    <div className="notification-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <small>{time}</small>
    </div>
  );
}

export default NotificationCard;