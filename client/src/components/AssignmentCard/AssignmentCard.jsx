import "./AssignmentCard.css";
import { Link } from "react-router-dom";

function AssignmentCard({ title, subject, deadline, status }) {
  return (
    <div className="assignment-card">
      <h3>{title}</h3>

      <p><strong>Subject:</strong> {subject}</p>

      <p><strong>Deadline:</strong> {deadline}</p>

      <span className={`status ${status.toLowerCase()}`}>
        {status}
      </span>

      <Link to="/submit-assignment">
  <button>Submit Assignment</button>
</Link>
    </div>
  );
}

export default AssignmentCard;