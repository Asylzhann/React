import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import GoogleButton from "../components/GoogleButton";

// Very small email check: something@something.something
const looksLikeEmail = (text) => /^\S+@\S+\.\S+$/.test(text);

export default function SignupPage() {
  const { user, signup, loginWithGoogle } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={location.state?.from ?? "/profile"} replace />;

  async function submit(e) {
    e.preventDefault();
    const cleanEmail = email.trim();
    // Check the form before asking Firebase.
    if (!looksLikeEmail(cleanEmail)) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("The password must have at least 6 characters.");
    if (password !== confirm) return setError("The passwords do not match.");

    setSubmitting(true);
    setError("");
    try {
      await signup(cleanEmail, password);
      // A new account is logged in automatically, so `user` changes and the redirect above happens.
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
        <h1>Create an account</h1>
        <p className="meta">It takes a few seconds.</p>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" disabled={submitting} />
        </label>
        <label className="field">
          Password (at least 6 characters)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" disabled={submitting} />
        </label>
        <label className="field">
          Confirm password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" disabled={submitting} />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" type="submit" disabled={submitting}>
          {submitting ? "Please wait…" : "Sign up"}
        </button>
        <p className="meta divider">or</p>
        <GoogleButton onClick={google} disabled={submitting} />
        <p className="meta">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
