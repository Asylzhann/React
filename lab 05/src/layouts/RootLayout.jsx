import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import StatusMessage from "../components/StatusMessage";

// The frame shared by every page: the navigation bar on top, the current page below it.
export default function RootLayout() {
  return (
    <div className="app">
      <NavBar />
      <main className="page">
        {/* Suspense shows the fallback while a lazy page is being downloaded */}
        <Suspense fallback={<StatusMessage kind="loading" message="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="footer">Pet Shelter · React Router demo</footer>
    </div>
  );
}
