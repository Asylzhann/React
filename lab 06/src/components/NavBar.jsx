import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/pets", label: "Pets" },
  { to: "/dashboard", label: "Dashboard" },
];

const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

// NavLink is a Link that knows if it points to the current page ("active").
// `end` stops "/" from counting as active on every page.
export default function NavBar() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="navbar">
      <NavLink to="/" end className="brand">
        Pet Shelter
      </NavLink>
      <nav aria-label="Main">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
            {link.label}
          </NavLink>
        ))}

        {/* Wait for Firebase before choosing, so the wrong links never flash. */}
        {!loading &&
          (user ? (
            <>
              <NavLink to="/profile" className={linkClass}>
                Profile
              </NavLink>
              <button className="nav-button" onClick={() => logout().catch(() => {})}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={linkClass}>
                Signup
              </NavLink>
            </>
          ))}
      </nav>
    </header>
  );
}
