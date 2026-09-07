import "./CourseTable.css";

function CourseTable({ courses }) {
  return (
    <table className="course-table">

      <thead>
        <tr>
          <th>Course Code</th>
          <th>Title</th>
          <th>Instructor</th>
          <th>Students</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>

        {courses.map((course) => (

          <tr key={course.id}>

            <td>{course.code}</td>

            <td>{course.title}</td>

            <td>{course.instructor}</td>

            <td>{course.students}</td>

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

export default CourseTable;