import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="page">
      <div className="shell-container workspace-hero">
        <div>
          <p className="eyebrow">404</p>
          <h1 className="page-title">This route is outside the current workspace map.</h1>
          <p className="lead-text">Return to the active product modules to continue with crop recommendations, pest diagnosis, or dashboard history.</p>
          <div className="hero-actions">
            <Link to="/" className="primary-button inline-button">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
