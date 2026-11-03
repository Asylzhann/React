import { Link, useLocation } from "react-router-dom";

// Shown for every address that no other route matches (path="*").
export default function NotFoundPage() {
  const { pathname } = useLocation();
  return (
    <div className="center-page">
      <p className="big-code">404</p>
      <h1>Page not found</h1>
      <p className="meta">
        There is nothing at <code>{pathname}</code>.
      </p>
      <div className="actions">
        <Link className="button primary" to="/">
          Go to Home
        </Link>
        <Link className="button" to="/pets">
          See the pets
        </Link>
      </div>
    </div>
  );
}
