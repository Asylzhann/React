import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import StatusMessage from "./StatusMessage";

// A route guard. Pages inside it are shown only to logged-in users.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // After a refresh Firebase needs a moment to restore the session. Wait; do not redirect yet.
  if (loading) return <StatusMessage kind="loading" message="Checking your session…" />;

  // Not logged in: go to /login and remember where the user wanted to go.
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  return <Outlet />;
}
