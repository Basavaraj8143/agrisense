import { Link } from "react-router-dom";

function CropPage() {
  return (
    <section className="page">
      <div className="shell-container route-hero">
        <div>
          <p className="eyebrow">Crop workflow</p>
          <h2>Route is ready for the Day 10 recommendation form.</h2>
          <p>
            The frontend foundation is now pointed at the Node API, which already brokers requests to the Python ML
            service. This page is the landing spot for the upcoming crop form and results cards.
          </p>
        </div>
        <div className="surface-card">
          <p className="card-kicker">What is wired now</p>
          <ul className="compact-list">
            <li>React route and shared shell</li>
            <li>API base URL utility for Node backend calls</li>
            <li>Auth token storage for protected endpoints</li>
          </ul>
          <Link to="/login" className="secondary-button inline-button">
            Sign in before testing protected APIs
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CropPage;
