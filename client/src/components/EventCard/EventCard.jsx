import "./EventCard.css";

function EventCard({ title, date, time, type }) {
  return (
    <div className="event-card">

      <div className="event-type">
        {type}
      </div>

      <h3>{title}</h3>

      <p><strong>Date:</strong> {date}</p>

      <p><strong>Time:</strong> {time}</p>

    </div>
  );
}

export default EventCard;