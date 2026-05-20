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
      <div className="shell-container workspace-hero">
        <div>
          <p className="eyebrow">Pest diagnosis workspace</p>
          <h1 className="page-title">Turn crop imagery into a structured diagnosis.</h1>
          <p className="lead-text">
            Signed in as {user?.name || "farmer"}. Upload a crop image, run the protected pest analysis route, and keep
            recent diagnoses visible for follow-up action.
          </p>
        </div>

        <aside className="surface-card workspace-summary accent-surface">
          <p className="card-kicker">Diagnosis coverage</p>
          <div className="stats-stack">
            <div className="summary-row">
              <strong>Accepted formats</strong>
              <span>JPEG, PNG, WebP</span>
            </div>
            <div className="summary-row">
              <strong>Result data</strong>
              <span>Name, confidence, treatment, and source metadata</span>
            </div>
            <div className="summary-row">
              <strong>History refresh</strong>
              <span>Recent scans update after every successful upload</span>
            </div>
          </div>
        </aside>
      </div>

      <div className="shell-container workspace-layout">
        <form className="surface-card workflow-panel" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="card-kicker">Image intake</p>
              <h2>Upload a clear crop sample.</h2>
            </div>
            <p>Higher quality images help the diagnosis service return more useful names, confidence scores, and treatment notes.</p>
          </div>

          <label className="upload-dropzone">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
            <span className="upload-title">{selectedFile ? selectedFile.name : "Drop or choose an image"}</span>
            <span className="upload-subtitle">The protected upload is sent to `/api/pest/detect` through the Node backend.</span>
          </label>

          {fieldErrors.image ? <p className="form-error">{fieldErrors.image}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          {previewUrl ? (
            <div className="image-preview-card">
              <img src={previewUrl} alt="Selected pest sample preview" className="image-preview" />
            </div>
          ) : (
            <div className="surface-card empty-state-card preview-placeholder">
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
                  <p className="card-kicker">Diagnosis result</p>
                  <h2>{result.scientificName}</h2>
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
                <article className="surface-card stat-card compact-metric">
                  <p className="metric-label">Source</p>
                  <strong className="metric-value meta-value">{result.meta?.source || "ml-service"}</strong>
                  <p>Returned through the Node broker so outage handling and metadata stay consistent.</p>
                </article>
                <article className="surface-card stat-card compact-metric">
                  <p className="metric-label">Latency</p>
                  <strong className="metric-value meta-value">{result.meta?.latencyMs ?? 0} ms</strong>
                  <p>Measured by the backend while persisting this pest diagnosis for history.</p>
                </article>
              </div>
            </div>
          ) : (
            <div className="surface-card results-panel">
              <p className="card-kicker">Awaiting analysis</p>
              <h2>Your diagnosis panel will appear here.</h2>
              <p className="state-copy">
                Upload a crop image to review the likely pest, confidence, treatment summary, and response metadata.
              </p>
              <div className="status-list status-list-spaced">
                <div className="status-row">
                  <span>Upload state</span>
                  <strong>{selectedFile ? "Ready" : "Awaiting image"}</strong>
                </div>
                <div className="status-row">
                  <span>History sync</span>
                  <strong>{historyStatus === "ready" ? "Healthy" : historyStatus === "loading" ? "Loading" : "Attention"}</strong>
                </div>
                <div className="status-row">
                  <span>Runtime path</span>
                  <strong>Protected multipart upload</strong>
                </div>
              </div>
            </div>
          )}

          <div className="surface-card results-panel">
            <div className="section-heading">
              <div>
                <p className="card-kicker">Recent analyses</p>
                <h2>Latest pest checks</h2>
              </div>
            </div>

            {historyStatus === "loading" ? <p className="state-copy">Loading recent pest history...</p> : null}
            {historyStatus === "error" ? <p className="form-error">Unable to load recent pest history right now.</p> : null}
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
