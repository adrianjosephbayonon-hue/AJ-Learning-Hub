import "./StudentTable.css";

function StudentTable({ students }) {
  return (
    <table className="student-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Course</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {students.map((student) => (

          <tr key={student.id}>

            <td>{student.name}</td>

            <td>{student.email}</td>

            <td>{student.course}</td>

            <td>{student.status}</td>

            <td>

              <button>View</button>

              <button>Message</button>

            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}

export default StudentTable;