import DashboardLayout from "../../layouts/DashboardLayout";
import CourseTable from "../../components/CourseTable/CourseTable";
import { Link } from "react-router-dom";
import "./ManageCourses.css";

function ManageCourses() {

  const courses = [

    {
      id:1,
      code:"CS301",
      title:"Programming Languages",
      instructor:"Adrian",
      students:15
    },

    {
      id:2,
      code:"CS302",
      title:"Automata Theory and Formal Languages",
      instructor:"Adrian",
      students:15
    },

    {
      id:3,
      code:"CS303",
      title:"Software Engineering 1",
      instructor:"Adrian",
      students:15
    },

   
  {
      id:4,
      code:"CSElec1",
      title:"Professional Elective 1(Mobile Programming 1)",
      instructor:"Adrian",
      students:15
    },

{
      id:5,
      code:"GE Elec3CS",
      title:"Reading Visual Art",
      instructor:"Adrian",
      students:15
    }

    




  ];

  return (

    <DashboardLayout>

      <div className="manage-header">

        <h1>Manage Courses</h1>

        <Link to="/create-course">
          <button>Create New Course</button>
        </Link>

      </div>

      <CourseTable courses={courses}/>

    </DashboardLayout>

  );

}

export default ManageCourses;