import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePwa } from "../context/PwaContext";
import ConnectionBadge from "./ConnectionBadge";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/pets", label: "Pets" },
  { to: "/breeds", label: "Breeds" },
  { to: "/dashboard", label: "Dashboard" },
];

const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const { canInstall, install } = usePwa();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="navbar">
      <NavLink to="/" end className="brand">
        Pet Shelter
      </NavLink>
      <ConnectionBadge />
      <button className="menu-button" aria-expanded={open} aria-controls="main-nav" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Menu"}
      </button>
      <nav id="main-nav" aria-label="Main" className={open ? "open" : ""}>
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
        {canInstall && (
          <button className="nav-button" onClick={install}>
            Install app
          </button>
        )}
      </nav>
    </header>
  );
}
