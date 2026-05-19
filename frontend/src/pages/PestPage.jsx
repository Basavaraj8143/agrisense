import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ApiError, pestApi, toFieldErrors } from "../lib/api-client";

const supportedTypes = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleString();
}

function PestPage() {
  const { token, user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [historyStatus, setHistoryStatus] = useState("loading");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let isCancelled = false;

    async function loadHistory() {
      setHistoryStatus("loading");

      try {
        const items = await pestApi.history(token, 6);

        if (!isCancelled) {
          setRecentItems(items);
          setHistoryStatus("ready");
        }
      } catch (error) {
        if (!isCancelled) {
          setHistoryStatus("error");
        }
      }
    }

    loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function handleFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFieldErrors({});
    setErrorMessage("");

    if (!nextFile) {
      setSelectedFile(null);
      return;
    }

    if (!supportedTypes.includes(nextFile.type)) {
      setSelectedFile(null);
      setFieldErrors({ image: "Image must be a JPEG, PNG, or WebP file." });
      return;
    }

    setSelectedFile(nextFile);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");

    if (!selectedFile) {
      setFieldErrors({ image: "Choose an image before starting analysis." });
      return;
    }

    setSubmitting(true);

    try {
      const response = await pestApi.detect(selectedFile, token);
      setResult(response);
      const latestItems = await pestApi.history(token, 6);
      setRecentItems(latestItems);
      setHistoryStatus("ready");
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors(toFieldErrors(error.details));
        setErrorMessage(error.message);
      } else {
        setErrorMessage("We could not analyze that image right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page page-pest">
      <div className="shell-container crop-hero">
        <div>
          <p className="eyebrow">Day 11 pest flow</p>
          <h2>Upload a crop image and turn ML output into clear treatment guidance.</h2>
          <p className="hero-text">
            Signed in as {user?.name || "farmer"}. This screen now sends a real multipart upload to the protected Node
            API and keeps your recent pest analyses visible in one place.
          </p>
        </div>
        <div className="surface-card crop-summary-card accent-card">
          <p className="card-kicker">Upload rules</p>
          <ul className="compact-list">
            <li>Supported types: JPEG, PNG, WebP</li>
            <li>Server-side size limits are enforced by upload middleware</li>
            <li>Graceful ML outage messaging is preserved from the backend</li>
          </ul>
        </div>
      </div>

      <div className="shell-container pest-layout">
        <form className="surface-card crop-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="card-kicker">Pest image</p>
              <h3>Analyze a leaf or crop photo</h3>
            </div>
            <p>Choose a clear image so the ML service can return cleaner names, confidence, and treatment notes.</p>
          </div>

          <label className="upload-dropzone">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            <span className="upload-title">{selectedFile ? selectedFile.name : "Drop or choose an image"}</span>
            <span className="upload-subtitle">JPEG, PNG, or WebP. Protected upload goes to `/api/pest/detect`.</span>
          </label>

          {fieldErrors.image ? <p className="form-error">{fieldErrors.image}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          {previewUrl ? (
            <div className="image-preview-card">
              <img src={previewUrl} alt="Selected pest sample preview" className="image-preview" />
            </div>
          ) : (
            <div className="empty-state-card surface-card preview-placeholder">
              <p className="card-kicker">Preview</p>
              <h3>No image selected yet.</h3>
              <p>Your upload preview appears here before analysis starts.</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Analyzing image..." : "Analyze pest"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl("");
                setResult(null);
                setFieldErrors({});
                setErrorMessage("");
              }}
            >
              Clear
            </button>
          </div>
        </form>

        <div className="results-column">
          {result ? (
            <div className="surface-card results-panel">
              <div className="section-heading">
                <div>
                  <p className="card-kicker">Analysis result</p>
                  <h3>{result.scientificName}</h3>
                </div>
                <p>Query ID: {result.queryId}</p>
              </div>

              <div className="result-stats">
                <span className="result-pill">{result.confidencePercent}% confidence</span>
                <span className="result-pill result-pill-soft">{result.commonNames}</span>
              </div>

              <article className="result-card result-card-featured">
                <p className="card-kicker">Treatment summary</p>
                <p>{result.treatmentSummary}</p>
              </article>

              <div className="meta-grid">
                <article className="metric-card">
                  <span className="metric-label">Source</span>
                  <strong className="metric-value meta-value">{result.meta?.source || "ml-service"}</strong>
                  <p>Returned through the Node broker so outages and request IDs stay consistent.</p>
                </article>
                <article className="metric-card muted">
                  <span className="metric-label">Latency</span>
                  <strong className="metric-value meta-value">{result.meta?.latencyMs ?? 0} ms</strong>
                  <p>Measured by the backend while persisting this pest query for dashboard history.</p>
                </article>
              </div>
            </div>
          ) : (
            <div className="surface-card empty-state-card">
              <p className="card-kicker">Awaiting analysis</p>
              <h3>Your diagnosis will appear here.</h3>
              <p>After upload, we will show scientific name, confidence, treatment guidance, and recent history.</p>
            </div>
          )}

          <div className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Recent analyses</p>
                <h3>Latest pest checks</h3>
              </div>
            </div>

            {historyStatus === "loading" ? <p className="state-copy">Loading recent pest history...</p> : null}
            {historyStatus === "error" ? (
              <p className="form-error">Unable to load recent pest history right now.</p>
            ) : null}
            {historyStatus === "ready" && recentItems.length === 0 ? (
              <div className="empty-inline-state">
                <p className="state-copy">No pest analyses yet. Your first upload will show up here.</p>
              </div>
            ) : null}
            {historyStatus === "ready" && recentItems.length > 0 ? (
              <div className="history-stack">
                {recentItems.map((item) => (
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
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PestPage;
