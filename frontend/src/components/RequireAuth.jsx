import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();

  if (status === "checking") {
    return (
      <section className="legacy-section">
        <div className="legacy-container">
          <div className="legacy-card legacy-not-found-card">
            <h2 className="legacy-card-title">Restoring your secure workspace</h2>
            <p className="legacy-card-copy">We are validating your saved session before opening the protected farming tools.</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAuth;
