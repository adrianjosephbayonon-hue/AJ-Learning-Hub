import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

function ProtectedRoute() {
  const { user } = useAuth();

  console.log("ProtectedRoute user:", user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;