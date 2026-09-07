import DashboardLayout from "../../layouts/DashboardLayout";
import ModuleTable from "../../components/ModuleTable/ModuleTable";
import { Link } from "react-router-dom";
import "./ManageModules.css";

function ManageModules() {

  const modules = [
    {
      id: 1,
      title: "Introduction in Programming Languages",
      course: "Programming Languages",
      file: "Programming.pdf",
      size: "2.4 MB",
    },
    {
      id: 2,
      title: "Introduction in Automata Theory and Formal Languages",
      course: "Automata Theory and Formal Languages",
      file: "Atfl.pdf",
      size: "5.8 MB",
    },
    {
      id: 3,
      title: "Software Engineering 1 Introduction",
      course: "Software Engineering 1",
      file: "rsoftware.pdf",
      size: "12.5 MB",
    },

{
      id: 4,
      title: "Introduction in Professional Elective 1",
      course: "Professional Elective 1(Mobile Programming 1)",
      file: "elective.pdf",
      size: "2.4 MB",
    },



    {
      id: 5,
      title: "Introduction in Reading Visual Art",
      course: "Reading Visual Art",
      file: "Reading Visual.pdf",
      size: "2.9 MB",
    },



  ];

  return (
    <DashboardLayout>

      <div className="manage-modules-header">

        <h1>Manage Modules</h1>

        <Link to="/upload-module">
          <button>Upload New Module</button>
        </Link>

      </div>

      <ModuleTable modules={modules} />

    </DashboardLayout>
  );
}

export default ManageModules;