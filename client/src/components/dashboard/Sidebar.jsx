import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Sidebar() {
  const { user } = useAuth();

  const isInstructor = user?.role === "instructor";

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

      <h2 className="text-2xl font-bold mb-8">
        AJ Learning Hub
      </h2>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard">
          🏠 Dashboard
        </Link>

        <Link to="/profile">
          👤 Profile
        </Link>

        <Link to="/courses">
          📚 My Courses
        </Link>

        <Link to="/materials">
          📂 Learning Materials
        </Link>

        {/* Student Assignments */}

        <Link to="/assignments">
          📝 Assignments
        </Link>

        <Link to="/announcements">
          📢 Announcements
        </Link>

        <Link to="/grades">
          📊 Grades
        </Link>

        <Link to="/calendar">
          📅 Calendar
        </Link>

        <Link to="/messages">
          💬 Messages
        </Link>

        <Link to="/notifications">
          🔔 Notifications
        </Link>

        <Link to="/settings">
          ⚙️ Settings
        </Link>

        {/* =================================================
            INSTRUCTOR ONLY
        ================================================= */}

        {isInstructor && (
          <>
            <div className="border-t border-slate-700 my-2" />

            <p className="text-xs font-semibold text-slate-400 uppercase">
              Instructor
            </p>

            <Link to="/instructor-submissions">
              📥 Student Submissions
            </Link>

            <Link to="/instructor-assignments">
              📝 Manage Assignments
            </Link>
          </>
        )}

      </nav>

    </aside>
  );
}

export default Sidebar;