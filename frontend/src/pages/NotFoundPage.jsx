import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <section className="page">
      <div className="shell-container route-hero">
        <div>
          <p className="eyebrow">404</p>
          <h2>This route has not been planted yet.</h2>
          <p>The React app shell is live, but this page does not exist in the current frontend milestone.</p>
          <Link to="/" className="primary-button inline-button">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;
