import { Link } from "react-router-dom";

const ROUTES = [
  ["/", "Home"],
  ["/about", "About"],
  ["/pets", "Pets list with search, filters, sort and pages"],
  ["/pets/:id", "One pet"],
  ["/breeds", "Dog breeds from a public API (works offline once saved)"],
  ["/breeds/:id", "Photos of one breed"],
  ["/offline", "Shown when a page cannot be opened offline"],
  ["/dashboard", "Statistics"],
  ["/login", "Log in with email or Google"],
  ["/signup", "Create an account"],
  ["/profile", "Your account (logged-in users only)"],
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
          Dog breeds come from the public Dog CEO API. Pets are loaded from a fake API (through Redux thunks): it answers after a random delay, sometimes fails on purpose, and keeps its data in the
          browser. You can add, edit and remove pets, and change a pet's status.
        </p>
      </section>

      <section className="panel">
        <h2>What is inside</h2>
        <ul className="plain">
          <li>React with React Router (nested routes, dynamic URLs, search parameters)</li>
          <li>Lazy loading of pages with React.lazy and Suspense</li>
          <li>Firebase Authentication (email and password, Google) shared through a React context</li>
          <li>Redux Toolkit: a store with pets, breeds and notices slices, async thunks, and memoized selectors</li>
          <li>A services file for all API calls and custom hooks that connect the pages to the store</li>
          <li>A PWA: web app manifest, service worker, offline page, update button, install button</li>
          <li>Public API (Dog CEO) cached by the service worker, with a notice when a saved copy is shown</li>
          <li>Reusable components: cards, filters, pagination, status messages</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Pages</h2>
        <div className="table-wrap">
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
        </div>
      </section>

      <p>
        <Link to="/pets">See the pets →</Link>
      </p>
    </div>
  );
}
