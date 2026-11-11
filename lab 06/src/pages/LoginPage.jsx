import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";

export default function LoginPage() {
  const { user, login, loginWithGoogle } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Where to go after logging in: the page the user was trying to open, or the profile.
  const from = location.state?.from ?? "/profile";

  // Already logged in (or just logged in): leave this page.
  if (user) return <Navigate to={from} replace />;

  async function submit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(email.trim(), password);
      // On success `user` changes and the redirect above happens.
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  async function google() {
    setSubmitting(true);
    setError("");
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="panel login" onSubmit={submit} noValidate>
        <h1>Welcome back</h1>
        <p className="meta">Log in to see your profile.</p>
        {location.state?.from && <p className="meta">Please log in to open that page.</p>}
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={submitting} />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={submitting} />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : "Log in"}
        </button>
        <p className="meta divider">or</p>
        <GoogleButton onClick={google} disabled={submitting} />
        <p className="meta">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </div>
  );
}
