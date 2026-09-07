import "./MessageCard.css";

function MessageCard({ sender, subject, message, time }) {
  return (
    <div className="message-card">

      <div className="message-header">
        <h3>{sender}</h3>
        <span>{time}</span>
      </div>

      <h4>{subject}</h4>

      <p>{message}</p>

      <button>Reply</button>

    </div>
  );
}

export default MessageCard;