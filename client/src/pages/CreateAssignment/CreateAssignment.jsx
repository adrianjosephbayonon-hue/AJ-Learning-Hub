import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./CreateAssignment.css";

function CreateAssignment() {
  const [assignment, setAssignment] = useState({
    title: "",
    course: "",
    dueDate: "",
    points: "",
    instructions: "",
  });

  function handleChange(e) {
    setAssignment({
      ...assignment,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    console.log(assignment);

    alert("Assignment Created!");
  }

  return (
    <DashboardLayout>

      <div className="create-assignment">

        <h1>Create Assignment</h1>

        <form onSubmit={handleSubmit}>

          <label>Assignment Title</label>
          <input
            type="text"
            name="title"
            value={assignment.title}
            onChange={handleChange}
          />

          <label>Course</label>
          <input
            type="text"
            name="course"
            value={assignment.course}
            onChange={handleChange}
          />

          <label>Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={assignment.dueDate}
            onChange={handleChange}
          />

          <label>Points</label>
          <input
            type="number"
            name="points"
            value={assignment.points}
            onChange={handleChange}
          />

          <label>Instructions</label>

          <textarea
            rows="6"
            name="instructions"
            value={assignment.instructions}
            onChange={handleChange}
          />

          <button>Create Assignment</button>

        </form>

      </div>

    </DashboardLayout>
  );
}

export default CreateAssignment;