import { Link } from "react-router-dom";
import { useTheme } from "../../contexts/useTheme";

function Sidebar() {
  const { darkMode } = useTheme();

  return (
    <aside
      className={`w-64 min-h-screen p-6 transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-900 text-white"
      }`}
    >
      <h2 className="text-2xl font-bold mb-8">
        AJ Learning Hub
      </h2>

      <nav className="flex flex-col gap-4">

        <Link
          to="/dashboard"
          className="hover:text-blue-400 transition-colors"
        >
          🏠 Dashboard
        </Link>

        <Link
          to="/profile"
          className="hover:text-blue-400 transition-colors"
        >
          👤 Profile
        </Link>

        <Link
          to="/courses"
          className="hover:text-blue-400 transition-colors"
        >
          📚 My Courses
        </Link>

        <Link
          to="/materials"
          className="hover:text-blue-400 transition-colors"
        >
          📂 Learning Materials
        </Link>

        <Link
          to="/assignments"
          className="hover:text-blue-400 transition-colors"
        >
          📝 Assignments
        </Link>

        <Link
          to="/announcements"
          className="hover:text-blue-400 transition-colors"
        >
          📢 Announcements
        </Link>

        <Link
          to="/grades"
          className="hover:text-blue-400 transition-colors"
        >
          📊 Grades
        </Link>

        <Link
          to="/calendar"
          className="hover:text-blue-400 transition-colors"
        >
          📅 Calendar
        </Link>

        <Link
          to="/messages"
          className="hover:text-blue-400 transition-colors"
        >
          💬 Messages
        </Link>

        <Link
          to="/notifications"
          className="hover:text-blue-400 transition-colors"
        >
          🔔 Notifications
        </Link>

        <Link
          to="/settings"
          className="hover:text-blue-400 transition-colors"
        >
          ⚙️ Settings
        </Link>

        <Link
          to="/instructor"
          className="hover:text-blue-400 transition-colors"
        >
          🎓 Instructor Panel
        </Link>

      </nav>
    </aside>
  );
}

export default Sidebar;