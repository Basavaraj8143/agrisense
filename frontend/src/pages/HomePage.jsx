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
    title: "Pest and dashboard live",
    body: "Pest upload, recent history, and dashboard summaries now read from protected backend APIs instead of placeholders.",
  },
];

function HomePage() {
  return (
    <section className="page page-home">
      <div className="shell-container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Feature complete MVP</p>
          <h2 className="hero-title">A field console for farmers, rebuilt around the new Node and ML services.</h2>
          <p className="hero-text">
            Day 11 completes the frontend MVP with pest upload, live dashboard history, and stronger loading, error,
            and empty states across the protected experience.
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
            <strong className="metric-value">Day 11</strong>
            <p>Pest upload, dashboard history, protected flows, and polished empty/loading/error states.</p>
          </div>
          <div className="metric-card muted">
            <span className="metric-label">Next handoff</span>
            <strong className="metric-value">Day 12</strong>
            <p>Testing, unhappy-path validation, and bug hardening can now focus on a full working MVP.</p>
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
