import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function InstructorRoute() {
  const { user } = useAuth();

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not instructor
  if (user.role !== "instructor") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default InstructorRoute;