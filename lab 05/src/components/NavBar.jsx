import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/pets", label: "Pets" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/login", label: "Login" },
];

// NavLink is a Link that knows if it points to the current page ("active").
// `end` stops "/" from counting as active on every page.
export default function NavBar() {
  return (
    <header className="navbar">
      <NavLink to="/" end className="brand">
        Pet Shelter
      </NavLink>
      <nav aria-label="Main">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
