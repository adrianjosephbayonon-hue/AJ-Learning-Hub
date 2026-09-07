import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import "./CreateCourse.css";

function CreateCourse() {
  const [course, setCourse] = useState({
    title: "",
    code: "",
    instructor: "",
    description: "",
  });

  function handleChange(e) {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    alert("Course Created!");

    console.log(course);
  }

  return (
    <DashboardLayout>
      <div className="create-course">

        <h1>Create Course</h1>

        <form onSubmit={handleSubmit}>

          <label>Course Title</label>

          <input
            type="text"
            name="title"
            value={course.title}
            onChange={handleChange}
            placeholder="Web Development"
          />

          <label>Course Code</label>

          <input
            type="text"
            name="code"
            value={course.code}
            onChange={handleChange}
            placeholder="CS301"
          />

          <label>Instructor</label>

          <input
            type="text"
            name="instructor"
            value={course.instructor}
            onChange={handleChange}
            placeholder="Prof. Adrian"
          />

          <label>Description</label>

          <textarea
            name="description"
            rows="5"
            value={course.description}
            onChange={handleChange}
          />

          <button>Create Course</button>

        </form>

      </div>
    </DashboardLayout>
  );
}

export default CreateCourse;