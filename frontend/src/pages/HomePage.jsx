import { Link } from "react-router-dom";

const capabilityCards = [
  {
    title: "Crop Recommendation",
    body: "Combine field location, nutrient profile, and season context to generate localized crop choices with audit metadata.",
  },
  {
    title: "Pest Detection",
    body: "Upload crop imagery, route it through the diagnosis service, and review confidence plus treatment guidance in one place.",
  },
  {
    title: "Operational History",
    body: "Keep recent crop runs and pest analyses visible so every protected workflow leaves behind an auditable record.",
  },
];

const outcomeMetrics = [
  { label: "Decision flows", value: "3", detail: "Crop, pest, and dashboard modules now ship inside one shared shell." },
  { label: "Protected APIs", value: "4+", detail: "Auth, crop history, pest history, and uploads run through the Node backend." },
  { label: "Location inputs", value: "2", detail: "Image-assisted extraction and manual entry both stay available to the farmer." },
];

const trustPoints = [
  "JWT-protected routes keep user workflows inside a secure session.",
  "ML calls are brokered through the Node backend so source and latency metadata remain visible.",
  "History persistence now lands in PostgreSQL through Prisma and Neon.",
];

function HomePage() {
  return (
    <section className="page page-home">
      <div className="shell-container page-intro">
        <div className="intro-copy">
          <p className="eyebrow">AgriSense platform</p>
          <h1 className="page-title">Field intelligence for crop planning and pest diagnosis.</h1>
          <p className="lead-text">
            AgriSense brings crop recommendation, pest detection, and recent field history into one clean product
            workspace built for practical agricultural decision support.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="primary-button">
              Start workspace
            </Link>
            <Link to="/crop" className="secondary-button">
              Open crop workflow
            </Link>
          </div>
        </div>

        <aside className="surface-card intro-card">
          <p className="card-kicker">Why it feels product-ready</p>
          <div className="stats-stack">
            <div className="summary-row">
              <strong>Localized recommendations</strong>
              <span>Image or manual location entry</span>
            </div>
            <div className="summary-row">
              <strong>Structured diagnosis</strong>
              <span>Confidence, treatment, and source metadata</span>
            </div>
            <div className="summary-row">
              <strong>Persisted history</strong>
              <span>Protected backend routes with PostgreSQL storage</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="shell-container stats-row">
        {outcomeMetrics.map((metric) => (
          <article key={metric.label} className="surface-card stat-card">
            <p className="metric-label">{metric.label}</p>
            <strong className="metric-value">{metric.value}</strong>
            <p>{metric.detail}</p>
          </article>
        ))}
      </div>

      <div className="shell-container content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Core capabilities</p>
            <h2 className="section-title">Built as a modular agri-tech workspace, not a single demo page.</h2>
          </div>
          <p className="section-copy">
            Each workflow is designed to feel like part of the same operational product, with shared session handling,
            status cues, and backend-backed results.
          </p>
        </div>

        <div className="capability-grid">
          {capabilityCards.map((card) => (
            <article key={card.title} className="surface-card capability-card">
              <p className="card-kicker">Module</p>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="shell-container workflow-strip">
        <article className="surface-card proof-card">
          <p className="card-kicker">Workflow pattern</p>
          <h3>Capture field context</h3>
          <p>Start with location, image evidence, or direct field inputs depending on how the farmer actually begins the task.</p>
        </article>
        <article className="surface-card proof-card">
          <p className="card-kicker">Workflow pattern</p>
          <h3>Run guided analysis</h3>
          <p>Use the protected backend to call the recommendation or diagnosis service and preserve traceable metadata.</p>
        </article>
        <article className="surface-card proof-card">
          <p className="card-kicker">Workflow pattern</p>
          <h3>Review recent outputs</h3>
          <p>Keep crop and pest records visible in the dashboard so the product feels like a continuing workspace.</p>
        </article>
      </div>

      <div className="shell-container content-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Trust signals</p>
            <h2 className="section-title">Clear system cues matter as much as the recommendations themselves.</h2>
          </div>
        </div>

        <div className="trust-grid">
          <article className="surface-card trust-card">
            <p className="card-kicker">Operational confidence</p>
            <ul className="bullet-list">
              {trustPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="surface-card trust-card accent-surface">
            <p className="card-kicker">Next action</p>
            <h3>Move directly into the real workflows.</h3>
            <p>
              Register an account, open the crop workspace, or test pest diagnosis with live backend and database
              connectivity already wired in.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="primary-button compact-button">
                Create account
              </Link>
              <Link to="/dashboard" className="secondary-button compact-button">
                View dashboard
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
