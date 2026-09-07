import "./AnnouncementCard.css";

function AnnouncementCard({ title, date, content }) {
  return (
    <div className="announcement-card">

      <h2>{title}</h2>

      <small>{date}</small>

      <p>{content}</p>

    </div>
  );
}

export default AnnouncementCard;