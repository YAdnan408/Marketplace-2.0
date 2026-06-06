import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRole }) {
  // Auth state from AuthContext
  const { isAuthenticated, user, loading } = useAuth();

  // While AuthContext is calling GET /api/me on mount, show nothing.
  // Without this, ProtectedRoute would redirect to /login on every refresh
  // before the session check completes.
  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.user_type !== allowedRole) {
    return (
      <Navigate
        to={user?.user_type === "seller" ? "/seller/dashboard" : "/customer/dashboard"}
        replace
      />
    );
  }

  return <Outlet />;
}