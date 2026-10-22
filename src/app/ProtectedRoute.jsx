import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleGuard = ({ allowedRoles }) => {
  const { role } = useAuth();

  const userRole = role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map((r) => r.toLowerCase());

  if (!userRole || !normalizedAllowedRoles.includes(userRole)) {
    // If an employee tries to access an unallowed admin page, redirect them to their home module
    if (userRole === "employee") {
      return <Navigate to="/calendar" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Auto-redirects users to their respective default home module on root path '/'
export const RootRedirect = () => {
  const { role } = useAuth();
  const userRole = role?.toLowerCase();

  if (userRole === "employee") {
    return <Navigate to="/calendar" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default ProtectedRoute;