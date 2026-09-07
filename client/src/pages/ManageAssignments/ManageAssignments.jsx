import DashboardLayout from "../../layouts/DashboardLayout";
import AssignmentTable from "../../components/AssignmentTable/AssignmentTable";
import { Link } from "react-router-dom";
import "./ManageAssignments.css";

function ManageAssignments() {

  const assignments = [
    {
      id: 1,
      title: "React Components",
      course: "Programming Languages",
      dueDate: "2026-08-20",
      points: 100,
    },
    {
      id: 2,
      title: "Brief theory about automata",
      course: "Automata Theory and Formal Languages",
      dueDate: "2026-08-25",
      points: 100,
    },
    {
      id: 3,
      title: "Make a basic software",
      course: "Software Engineering",
      dueDate: "2026-08-30",
      points: 50,
    },
  ];

  return (
    <DashboardLayout>

      <div className="manage-assignment-header">

        <h1>Manage Assignments</h1>

        <Link to="/create-assignment">
          <button>Create Assignment</button>
        </Link>

      </div>

      <AssignmentTable assignments={assignments} />

    </DashboardLayout>
  );
}

export default ManageAssignments;