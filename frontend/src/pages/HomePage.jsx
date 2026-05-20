import { Link } from "react-router-dom";

const features = [
  {
    title: "AI Crop Recommendation",
    body: "Upload a field image or enter location details manually to get localized crop guidance from the protected backend.",
  },
  {
    title: "Pest Detection",
    body: "Send crop imagery through the diagnosis workflow and review confidence, common names, and treatment guidance.",
  },
  {
    title: "Farmer Dashboard",
    body: "Keep recent crop and pest activity in one place so every recommendation and analysis remains visible later.",
  },
];

const stats = [
  { value: "2", label: "Field workflows", accent: "green" },
  { value: "100%", label: "React-based app shell", accent: "blue" },
  { value: "24/7", label: "Protected access", accent: "purple" },
  { value: "1", label: "Unified dashboard", accent: "orange" },
];

function HomePage() {
  return (
    <section className="legacy-section legacy-home">
      <div className="legacy-container">
        <div className="legacy-hero-card">
          <div className="legacy-hero-content">
            <h2 className="legacy-hero-title">Smarter crop planning and pest diagnosis for every farmer.</h2>
            <p className="legacy-hero-text">
              AgriSense combines crop recommendation, pest detection, and saved field history into one simple farming
              workspace backed by the new Node and ML services.
            </p>
            <div className="legacy-button-row">
              <Link to="/register" className="legacy-white-button">
                Get Started
              </Link>
              <Link to="/crop" className="legacy-ghost-white-button">
                Try Crop Recommendation
              </Link>
            </div>
          </div>
        </div>

        <div className="legacy-stats-grid">
          {stats.map((stat) => (
            <article key={stat.label} className={`legacy-stat-card accent-${stat.accent}`}>
              <div className="legacy-stat-value">{stat.value}</div>
              <div className="legacy-stat-label">{stat.label}</div>
            </article>
          ))}
        </div>

        <div className="legacy-section-header">
          <h3 className="legacy-section-title">Core platform features</h3>
          <p className="legacy-section-subtitle">
            The older AgriSense UI had a simpler rhythm, so this React version now follows the same layout language
            while keeping the live backend underneath.
          </p>
        </div>

        <div className="legacy-feature-grid">
          {features.map((feature) => (
            <article key={feature.title} className="legacy-card legacy-card-hover">
              <h4 className="legacy-card-title">{feature.title}</h4>
              <p className="legacy-card-copy">{feature.body}</p>
            </article>
          ))}
        </div>

        <div className="legacy-two-column">
          <article className="legacy-card">
            <h4 className="legacy-card-title">Why this rebuild works better now</h4>
            <ul className="legacy-list">
              <li>Protected auth flow stores the JWT and restores the user session.</li>
              <li>Crop recommendations and pest checks run through the current backend APIs.</li>
              <li>Recent activity is persisted and shown inside the dashboard route.</li>
            </ul>
          </article>

          <article className="legacy-gradient-panel">
            <h4 className="legacy-card-title">Ready to test the live app?</h4>
            <p className="legacy-gradient-copy">
              Create an account, open crop recommendation, or upload a pest image and follow the same workflows you
              already liked in the older frontend.
            </p>
            <div className="legacy-button-row">
              <Link to="/register" className="legacy-white-button">
                Create Account
              </Link>
              <Link to="/dashboard" className="legacy-ghost-white-button">
                Open Dashboard
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default HomePage;
