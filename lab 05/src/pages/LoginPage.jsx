import { useState } from "react";
import { Link } from "react-router-dom";

// A placeholder: it looks like a login form but does not log anyone in yet.
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage("Enter your email and password.");
      return;
    }
    setMessage("Sign in is not available yet. Real authentication will be added later.");
  };

  return (
    <div className="login-wrap">
      <form className="panel login" onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="meta">Sign in to manage the shelter.</p>
        <label className="field">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label className="field">
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {message && (
          <p className="login-message" role="status">
            {message}
          </p>
        )}
        <button className="primary" type="submit">
          Sign in
        </button>
        <p className="meta">
          Just looking? <Link to="/pets">Browse the pets</Link>
        </p>
      </form>
    </div>
  );
}
