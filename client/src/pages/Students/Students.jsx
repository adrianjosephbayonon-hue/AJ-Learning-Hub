import DashboardLayout from "../../layouts/DashboardLayout";
import StudentTable from "../../components/StudentTable/StudentTable";
import "./Students.css";

function Students() {

  const students = [
    {
      id: 1,
      name: "Adrian Joseph Bayonon",
      email: "adrianjosephbayonon@gmail.com",
      course: "Web Development",
      status: "Active",
    },
    {
      id: 2,
      name: "tanga ada",
      email: "tanga@example.com",
      course: "Database Systems",
      status: "Active",
    },
    {
      id: 3,
      name: "review kit",
      email: "review@example.com",
      course: "Programming Languages",
      status: "Inactive",
    },
  ];

  return (
    <DashboardLayout>

      <h1>Student Management</h1>

      <StudentTable students={students} />

    </DashboardLayout>
  );
}

export default Students;