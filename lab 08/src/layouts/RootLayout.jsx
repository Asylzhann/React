import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import NoticeList from "../components/NoticeList";
import StatusMessage from "../components/StatusMessage";
import AppNotices from "../components/AppNotices";
import { useAuth } from "../context/AuthContext";

export default function RootLayout() {
  const { error } = useAuth(); // a problem with Firebase itself (for example a missing .env.local)
  return (
    <div className="app">
      <NavBar />
      <AppNotices />
      <main className="page">
        {error && (
          <p className="notice error" role="alert">
            {error}
          </p>
        )}
        <NoticeList />
        <Suspense fallback={<StatusMessage kind="loading" message="Loading page…" />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="footer">Pet Shelter · Redux Toolkit + PWA</footer>
    </div>
  );
}
