import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RequireAuth({ children }) {
  const location = useLocation();
  const { isAuthenticated, status } = useAuth();

  if (status === "checking") {
    return (
      <section className="page">
        <div className="shell-container">
          <div className="surface-card gate-card">
            <p className="eyebrow">Checking session</p>
            <h2>Restoring your secure workspace.</h2>
            <p>We are validating your saved session before opening protected tools.</p>
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
