import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ApiError, pestApi, toFieldErrors } from "../lib/api-client";

const supportedTypes = ["image/jpeg", "image/png", "image/webp"];

function formatDate(value) {
  if (!value) {
    return "Unknown time";
  }

  return new Date(value).toLocaleDateString();
}

function PestPage() {
  const { token } = useAuth();
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
    <section className="legacy-section">
      <div className="legacy-container">
        <div className="legacy-page-intro centered">
          <h2 className="legacy-page-title">Pest Detection & Identification</h2>
          <p className="legacy-page-subtitle">
            Upload an image of the insect or pest for quick identification and management recommendations.
          </p>
        </div>

        <div className="legacy-workspace-grid">
          <div className="legacy-card legacy-form-card">
            <div className="legacy-upload-wrapper">
              <label className="legacy-upload-zone pest">
                <input
                  type="file"
                  className="legacy-hidden-input"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />

                {!previewUrl ? (
                  <div className="legacy-upload-placeholder">
                    <div className="legacy-upload-icon">IMG</div>
                    <p className="legacy-upload-title">Upload Insect/Pest Image</p>
                    <p className="legacy-helper-text">Click to select or drag and drop. Supported formats: JPG, PNG, WEBP.</p>
                  </div>
                ) : (
                  <div className="legacy-upload-preview">
                    <img src={previewUrl} alt="Selected pest sample preview" className="legacy-upload-image pest" />
                  </div>
                )}
              </label>

              {fieldErrors.image ? <small className="legacy-field-error">{fieldErrors.image}</small> : null}
              {errorMessage ? <div className="legacy-error-box">{errorMessage}</div> : null}

              {previewUrl ? (
                <div className="legacy-button-row">
                  <button type="button" className="legacy-solid-button" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Identifying Pest..." : "Identify Pest"}
                  </button>
                  <button
                    type="button"
                    className="legacy-text-button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl("");
                      setResult(null);
                      setFieldErrors({});
                      setErrorMessage("");
                    }}
                  >
                    Retake
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="legacy-card legacy-results-card">
            <h3 className="legacy-card-title">Detection Results</h3>
            {!result ? (
              <div className="legacy-empty-result">
                <div className="legacy-empty-icon">PEST</div>
                <p>Upload an image to identify pests and review management guidance.</p>
              </div>
            ) : (
              <div className="legacy-pest-result">
                <div className="legacy-pest-result-row">
                  <span>Scientific Name</span>
                  <strong>{result.scientificName}</strong>
                </div>
                <div className="legacy-pest-result-row">
                  <span>Confidence</span>
                  <strong>{result.confidencePercent}%</strong>
                </div>
                <div className="legacy-pest-result-row">
                  <span>Common Names</span>
                  <strong>{result.commonNames}</strong>
                </div>
                <div className="legacy-pest-about">
                  <h4>About</h4>
                  <p>{result.treatmentSummary}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="legacy-dashboard-section">
          <div className="legacy-dashboard-section-header">
            <h3 className="legacy-dashboard-section-title">Recent Pest Checks</h3>
          </div>
          {historyStatus === "loading" ? <div className="legacy-empty-panel">Loading recent pest history...</div> : null}
          {historyStatus === "error" ? <div className="legacy-empty-panel">Unable to load recent pest history right now.</div> : null}
          {historyStatus === "ready" ? (
            <div className="legacy-record-grid">
              {recentItems.length === 0 ? (
                <div className="legacy-empty-panel">No pest analyses yet. Your first upload will show up here.</div>
              ) : (
                recentItems.map((item) => (
                  <article key={item.id} className="legacy-card legacy-card-hover">
                    <h4 className="legacy-card-title">{item.result?.scientificName || "Unknown pest"}</h4>
                    <p className="legacy-card-copy">{item.result?.commonNames || "Unknown common name"}</p>
                    <div className="legacy-record-meta">
                      <span>{item.result?.confidencePercent ?? 0}% confidence</span>
                      <span>{formatDate(item.createdAt)}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default PestPage;
