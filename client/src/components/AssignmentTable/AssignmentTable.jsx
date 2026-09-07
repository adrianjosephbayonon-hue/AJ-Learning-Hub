import "./AssignmentTable.css";

function AssignmentTable({ assignments }) {
  return (
    <table className="assignment-table">

      <thead>
        <tr>
          <th>Title</th>
          <th>Course</th>
          <th>Due Date</th>
          <th>Points</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {assignments.map((assignment) => (

          <tr key={assignment.id}>

            <td>{assignment.title}</td>

            <td>{assignment.course}</td>

            <td>{assignment.dueDate}</td>

            <td>{assignment.points}</td>

            <td>
              <button>Edit</button>
              <button className="delete">
                Delete
              </button>
            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}

export default AssignmentTable;