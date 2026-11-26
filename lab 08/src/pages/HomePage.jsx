import { Link } from "react-router-dom";
import hero from "../assets/hero.svg";

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-text">
        <h1>Find a friend who is waiting for you</h1>
        <p>
          Pet Shelter lists the dogs, cats and other animals that are looking for a home. Browse them, open a profile, and
          follow how many are still available.
        </p>
        <div className="actions">
          <Link className="button primary" to="/pets">
            Browse pets
          </Link>
          <Link className="button" to="/dashboard">
            See the dashboard
          </Link>
          <Link className="button" to="/about">
            About the project
          </Link>
        </div>
      </div>
      <img className="hero-image" src={hero} alt="A paw print" />
    </section>
  );
}
