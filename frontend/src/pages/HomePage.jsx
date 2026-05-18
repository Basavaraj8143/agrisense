import { Link } from "react-router-dom";

const routeCards = [
  {
    title: "Auth flow live",
    body: "Register and login now enforce backend-aligned validation, persist the JWT, and route users into protected screens.",
  },
  {
    title: "Protected crop flow",
    body: "The crop screen now submits to the real Node API and renders normalized recommendation cards with metadata.",
  },
  {
    title: "Backend-first flow",
    body: "React stays aligned with the rebuild architecture by calling the Node API, which then brokers ML work through the Python service.",
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
            Day 10 turns the React foundation into a working user flow: authentication, protected routes, and crop
            recommendations that come back in the new backend response shape.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Create account
            </Link>
            <Link to="/crop" className="secondary-button">
              Open crop workflow
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metric-card">
            <span className="metric-label">Current milestone</span>
            <strong className="metric-value">Day 10</strong>
            <p>Auth screens, protected crop flow, client validation, and API-connected results cards.</p>
          </div>
          <div className="metric-card muted">
            <span className="metric-label">Next handoff</span>
            <strong className="metric-value">Day 11</strong>
            <p>Pest upload, dashboard history, and broader empty/loading/responsive polish build on this flow.</p>
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
