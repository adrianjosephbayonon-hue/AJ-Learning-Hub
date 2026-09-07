import "./ModuleTable.css";

function ModuleTable({ modules }) {
  return (
    <table className="module-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Course</th>
          <th>File</th>
          <th>Size</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {modules.map((module) => (
          <tr key={module.id}>
            <td>{module.title}</td>
            <td>{module.course}</td>
            <td>{module.file}</td>
            <td>{module.size}</td>

            <td>
              <button>View</button>
              <button>Edit</button>
              <button className="delete">Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ModuleTable;