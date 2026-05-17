import { Link } from "react-router-dom";

const routeCards = [
  {
    title: "Auth-ready entry",
    body: "Login and registration routes are wired into a shared auth context so Day 10 can focus on form polish and edge cases.",
  },
  {
    title: "Clean app shell",
    body: "Navigation, header, footer, and page layout are centralized to avoid copying structure across feature screens.",
  },
  {
    title: "Backend-first flow",
    body: "The frontend is already pointed at the Node API, which means the React work stays aligned with the rebuild architecture.",
  },
];

function HomePage() {
  return (
    <section className="page page-home">
      <div className="shell-container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Phase 4 begins</p>
          <h2 className="hero-title">A field console for farmers, rebuilt around the new Node and ML services.</h2>
          <p className="hero-text">
            Day 9 establishes the React foundation: routing, app shell, auth state, and the shared API plumbing that the
            next feature screens will sit on.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Create account
            </Link>
            <Link to="/crop" className="secondary-button">
              Preview crop route
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric-card">
            <span className="metric-label">Current milestone</span>
            <strong className="metric-value">Day 9</strong>
            <p>React foundation, routing, app shell, API client, auth token persistence.</p>
          </div>
          <div className="metric-card muted">
            <span className="metric-label">Next handoff</span>
            <strong className="metric-value">Day 10</strong>
            <p>Feature screens for auth and crop workflows plug into this base instead of starting from scratch.</p>
          </div>
        </div>
      </div>

      <div className="shell-container card-grid">
        {routeCards.map((card) => (
          <article key={card.title} className="surface-card">
            <p className="card-kicker">Foundation</p>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default HomePage;
