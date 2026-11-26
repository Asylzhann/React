import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePwa } from "../context/PwaContext";

export default function OfflinePage() {
  const { online, checkNow } = usePwa();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (online && from) navigate(from, { replace: true });
  }, [online, from, navigate]);

  async function retry() {
    setChecking(true);
    setMessage("");
    const ok = await checkNow();
    setChecking(false);
    if (ok) navigate(from ?? "/", { replace: true });
    else setMessage("Still offline. Check your connection and try again.");
  }

  return (
    <div className="center-page offline-page">
      <svg className="offline-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10 5.2M5 12.9a10 10 0 0 1 5.2-2.8M19 12.9a10 10 0 0 0-2.4-1.8M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M2 2l20 20" />
      </svg>
      <h1>{online ? "You are online" : "You are offline"}</h1>
      <p className="meta">
        {online
          ? "The connection works. You can go back to the app."
          : "This page needs the internet and has not been saved on this device yet. Pages you already opened still work."}
      </p>
      <button className="primary" onClick={retry} disabled={checking}>
        {checking ? "Checking…" : "Retry Connection"}
      </button>
      {message && (
        <p className="form-error" role="status">
          {message}
        </p>
      )}
      <div className="actions">
        <Link className="button" to="/">
          Home
        </Link>
        <Link className="button" to="/pets">
          Pets
        </Link>
        <Link className="button" to="/breeds">
          Saved breeds
        </Link>
      </div>
    </div>
  );
}
