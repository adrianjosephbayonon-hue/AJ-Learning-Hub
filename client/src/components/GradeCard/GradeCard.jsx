import "./GradeCard.css";

function GradeCard({ subject, instructor, grade, status }) {
  return (
    <div className="grade-card">
      <h3>{subject}</h3>

      <p>
        <strong>Instructor:</strong> {instructor}
      </p>

      <p>
        <strong>Grade:</strong> {grade}
      </p>

      <span className={`grade-status ${status.toLowerCase()}`}>
        {status}
      </span>
    </div>
  );
}

export default GradeCard;