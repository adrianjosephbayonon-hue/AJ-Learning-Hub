import "./CourseCard.css";
import { Link } from "react-router-dom";

function CourseCard({ title, description }) {
  return (
    <div className="course-card">
      <h3>{title}</h3>

      <p>{description}</p>

      <Link to="/courses/1">
        <button>Open Course</button>
      </Link>
    </div>
  );
}

export default CourseCard;