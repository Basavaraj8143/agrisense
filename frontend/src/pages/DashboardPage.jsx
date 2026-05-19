import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cropApi, pestApi } from "../lib/api-client";

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleString();
}

function DashboardPage() {
  const { token, user } = useAuth();
  const [cropItems, setCropItems] = useState([]);
  const [pestItems, setPestItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboard() {
      setStatus("loading");

      try {
        const [nextCropItems, nextPestItems] = await Promise.all([
          cropApi.history(token, 4),
          pestApi.history(token, 4),
        ]);

        if (!isCancelled) {
          setCropItems(nextCropItems);
          setPestItems(nextPestItems);
          setStatus("ready");
        }
      } catch (error) {
        if (!isCancelled) {
          setStatus("error");
        }
      }
    }

    loadDashboard();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  return (
    <section className="page">
      <div className="shell-container dashboard-hero">
        <div>
          <p className="eyebrow">Day 11 dashboard</p>
          <h2>Welcome back, {user?.name || "farmer"}.</h2>
          <p className="hero-text">
            This dashboard now reads from live backend history endpoints so your latest crop recommendations and pest
            analyses stay visible after each protected workflow.
          </p>
        </div>

        <div className="metric-grid">
          <article className="metric-card">
            <span className="metric-label">Recent crop queries</span>
            <strong className="metric-value">{cropItems.length}</strong>
            <p>Most recent recommendation records loaded for this session.</p>
          </article>
          <article className="metric-card muted">
            <span className="metric-label">Recent pest queries</span>
            <strong className="metric-value">{pestItems.length}</strong>
            <p>Latest uploaded pest analyses stored through the Node service.</p>
          </article>
        </div>
      </div>

      {status === "loading" ? (
        <div className="shell-container">
          <div className="surface-card empty-state-card">
            <p className="card-kicker">Loading dashboard</p>
            <h3>Fetching your recent work.</h3>
            <p>We are loading saved crop and pest history from the protected backend routes.</p>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="shell-container">
          <div className="form-error">Unable to load dashboard history right now. Please refresh after the backend is reachable.</div>
        </div>
      ) : null}

      {status === "ready" ? (
        <div className="shell-container dashboard-grid">
          <section className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Crop recommendations</p>
                <h3>Recent crop runs</h3>
              </div>
              <Link to="/crop" className="secondary-button inline-button">
                New crop run
              </Link>
            </div>

            {cropItems.length === 0 ? (
              <div className="empty-inline-state">
                <p className="state-copy">No crop recommendations yet. Start one from the crop workflow.</p>
              </div>
            ) : (
              <div className="history-stack">
                {cropItems.map((item) => (
                  <article key={item.id} className="history-card">
                    <div className="history-card-top">
                      <strong>{item.primaryCrop?.name || "Unknown crop"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>
                      {item.location?.district || "Unknown district"}, {item.location?.taluk || "Unknown taluk"} |{" "}
                      {item.season || "Unknown season"} | {item.soilType || "Unknown soil"}
                    </p>
                    <div className="result-stats">
                      <span className="result-pill">{Math.round((item.primaryCrop?.score || 0) * 100)}% match</span>
                      <span className="result-pill result-pill-soft">{item.meta?.source || "ml-service"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Pest analyses</p>
                <h3>Recent pest checks</h3>
              </div>
              <Link to="/pest" className="secondary-button inline-button">
                New pest scan
              </Link>
            </div>

            {pestItems.length === 0 ? (
              <div className="empty-inline-state">
                <p className="state-copy">No pest analyses yet. Upload an image from the pest workflow.</p>
              </div>
            ) : (
              <div className="history-stack">
                {pestItems.map((item) => (
                  <article key={item.id} className="history-card">
                    <div className="history-card-top">
                      <strong>{item.result?.scientificName || "Unknown pest"}</strong>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                    <p>{item.result?.commonNames || "Unknown common name"}</p>
                    <div className="result-stats">
                      <span className="result-pill">{item.result?.confidencePercent ?? 0}% confidence</span>
                      <span className="result-pill result-pill-soft">{item.meta?.source || "ml-service"}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </section>
  );
}

export default DashboardPage;
