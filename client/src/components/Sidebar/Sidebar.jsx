import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">

      <h2 className="text-2xl font-bold mb-8">
        AJ Learning Hub
      </h2>

      <nav className="flex flex-col gap-4">

        <Link to="/dashboard">🏠 Dashboard</Link>
        <Link to="/profile">👤 Profile</Link>
        <Link to="/courses">📚 My Courses</Link>
        <Link to="/materials">📂 Learning Materials</Link>
        <Link to="/assignments">📝 Assignments</Link>
        <Link to="/announcements">📢 Announcements</Link>
        <Link to="/grades">📊 Grades</Link>
        <Link to="/calendar">📅 Calendar</Link>
        <Link to="/messages">💬 Messages</Link>
        <Link to="/notifications">🔔 Notifications</Link>
        <Link to="/settings">⚙️ Settings</Link>
        <Link to="/instructor">🎓 Instructor Panel</Link>

      </nav>

    </aside>
  );
}

export default Sidebar;