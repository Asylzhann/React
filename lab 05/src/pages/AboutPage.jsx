import { Link } from "react-router-dom";

const ROUTES = [
  ["/", "Home"],
  ["/about", "About"],
  ["/pets", "Pets list with search, filters, sort and pages"],
  ["/pets/:id", "One pet"],
  ["/dashboard", "Statistics"],
  ["/login", "Login (placeholder)"],
  ["*", "Not found"],
];

export default function AboutPage() {
  return (
    <div className="stack">
      <h1>About this project</h1>
      <section className="panel">
        <p>
          Pet Shelter is a small React application built step by step during the course. It started as a single page that listed pets
          and became a multi-page app with React Router.
        </p>
        <p>
          Pets are loaded from a fake API: it answers after a random delay, sometimes fails on purpose, and keeps its data in the
          browser. You can add, edit and remove pets, and change a pet's status.
        </p>
      </section>

      <section className="panel">
        <h2>What is inside</h2>
        <ul className="plain">
          <li>React with React Router (nested routes, dynamic URLs, search parameters)</li>
          <li>Lazy loading of pages with React.lazy and Suspense</li>
          <li>A services file for all API calls and a hook that handles loading, errors and outdated answers</li>
          <li>Reusable components: cards, filters, pagination, status messages</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Pages</h2>
        <table className="routes">
          <tbody>
            {ROUTES.map(([path, what]) => (
              <tr key={path}>
                <td>
                  <code>{path}</code>
                </td>
                <td>{what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p>
        <Link to="/pets">See the pets →</Link>
      </p>
    </div>
  );
}
