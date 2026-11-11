import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import StatusMessage from "../components/StatusMessage";
import { useAuth } from "../context/AuthContext";

// The frame shared by every page: the navigation bar on top, the current page below it.
export default function RootLayout() {
  const { error } = useAuth(); // a problem with Firebase itself (for example a missing .env.local)
  return (
    <div className="app">
      <NavBar />
      <main className="page">
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        {/* Suspense shows the fallback while a lazy page is being downloaded */}
        <Suspense fallback={<StatusMessage kind="loading" message="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="footer">Pet Shelter · React Router demo</footer>
    </div>
  );
}
