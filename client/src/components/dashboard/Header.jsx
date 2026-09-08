import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors duration-300">

      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name || "Student"}
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="hidden md:block text-right">
          <p className="font-semibold text-gray-800 dark:text-white">
            {user?.name || "Student"}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.role || "student"}
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "S"}
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Header;