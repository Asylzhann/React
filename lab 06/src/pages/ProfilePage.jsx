import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { show } from "../utils/format";

// Shown only to logged-in users (see ProtectedRoute in App.jsx), so `user` is never null here.
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    setError("");
    try {
      await logout(); // `user` becomes null and ProtectedRoute sends the visitor to /login
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  const provider = user.providerData?.[0]?.providerId === "google.com" ? "Google" : "Email and password";

  return (
    <div className="stack">
      <h1>Your profile</h1>
      <section className="panel">
        <dl className="facts">
          <div>
            <dt>Email</dt>
            <dd>{show(user.email)}</dd>
          </div>
          <div>
            <dt>UID</dt>
            <dd className="uid">{user.uid}</dd>
          </div>
          <div>
            <dt>Signed in with</dt>
            <dd>{provider}</dd>
          </div>
        </dl>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button className="danger" onClick={handleLogout} disabled={busy}>
            {busy ? "Logging out…" : "Log out"}
          </button>
        </div>
      </section>
    </div>
  );
}
