import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="legacy-section">
      <div className="legacy-container">
        <div className="legacy-card legacy-not-found-card">
          <h2 className="legacy-page-title">This page does not exist.</h2>
          <p className="legacy-page-subtitle">Return to the active AgriSense workflows and continue from the main dashboard or homepage.</p>
          <Link to="/" className="legacy-solid-button">
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
