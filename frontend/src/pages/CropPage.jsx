import { useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ApiError, cropApi, toFieldErrors } from "../lib/api-client";

const initialForm = {
  mode: "manual_location",
  district: "",
  taluk: "",
  lat: "",
  lng: "",
  soilType: "black",
  season: "kharif",
  n: "120",
  p: "45",
  k: "160",
  ph: "6.8",
  autofillUsed: false,
  autofillSource: "manual",
};

const soilOptions = [
  { value: "alluvial", label: "Alluvial" },
  { value: "black", label: "Black" },
  { value: "clay", label: "Clay" },
  { value: "laterite", label: "Laterite" },
  { value: "loamy", label: "Loamy" },
  { value: "mixed", label: "Mixed" },
  { value: "red", label: "Red" },
  { value: "sandy", label: "Sandy" },
  { value: "silty", label: "Silty" },
];

const seasonOptions = [
  { value: "kharif", label: "Kharif" },
  { value: "rabi", label: "Rabi" },
  { value: "zaid", label: "Zaid" },
  { value: "whole_year", label: "Whole year" },
];

const autofillOptions = [
  { value: "manual", label: "Manual entry" },
  { value: "taluk_average", label: "Taluk average" },
  { value: "district_average", label: "District average" },
  { value: "default_fallback", label: "Default fallback" },
];

function formatScore(score) {
  if (typeof score !== "number") {
    return "N/A";
  }

  return `${Math.round(score * 100)}% match`;
}

function validateCropForm(form) {
  const errors = {};

  if (form.district.trim().length < 2) {
    errors["location.district"] = "District is required.";
  }

  if (form.taluk.trim().length < 2) {
    errors["location.taluk"] = "Taluk is required.";
  }

  if (form.mode === "image_gps") {
    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (Number.isNaN(lat) || lat < -90 || lat > 90) {
      errors["location.lat"] = "Latitude must be between -90 and 90.";
    }

    if (Number.isNaN(lng) || lng < -180 || lng > 180) {
      errors["location.lng"] = "Longitude must be between -180 and 180.";
    }
  }

  [
    ["n", 0, 300, "Nitrogen"],
    ["p", 0, 300, "Phosphorus"],
    ["k", 0, 300, "Potassium"],
    ["ph", 0, 14, "pH"],
  ].forEach(([field, min, max, label]) => {
    const value = Number(form[field]);

    if (Number.isNaN(value) || value < min || value > max) {
      errors[field] = `${label} must be between ${min} and ${max}.`;
    }
  });

  return errors;
}

function toPayload(form) {
  const payload = {
    location: {
      mode: form.mode,
      district: form.district.trim(),
      taluk: form.taluk.trim(),
    },
    soilType: form.soilType,
    season: form.season,
    n: Number(form.n),
    p: Number(form.p),
    k: Number(form.k),
    ph: Number(form.ph),
    autofill: {
      used: form.autofillUsed,
      source: form.autofillUsed ? form.autofillSource : "manual",
    },
  };

  if (form.mode === "image_gps") {
    payload.location.lat = Number(form.lat);
    payload.location.lng = Number(form.lng);
  }

  return payload;
}

function CropResultCard({ title, crop, featured = false }) {
  if (!crop) {
    return null;
  }

  return (
    <article className={`result-card ${featured ? "result-card-featured" : ""}`}>
      <p className="card-kicker">{title}</p>
      <h3>{crop.name}</h3>
      <div className="result-stats">
        <span className="result-pill">{formatScore(crop.score)}</span>
        {crop.yieldData ? <span className="result-pill result-pill-soft">{crop.yieldData}</span> : null}
        {crop.marketPrice ? <span className="result-pill result-pill-soft">{crop.marketPrice}</span> : null}
      </div>
    </article>
  );
}

function CropPage() {
  const { token, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const clientErrors = validateCropForm(form);
    setFieldErrors(clientErrors);
    setErrorMessage("");

    if (Object.keys(clientErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await cropApi.recommend(toPayload(form), token);
      setResult(response);
    } catch (error) {
      if (error instanceof ApiError) {
        setFieldErrors((current) => ({ ...current, ...toFieldErrors(error.details) }));
        setErrorMessage(error.message);
      } else {
        setErrorMessage("We could not generate a recommendation right now. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page page-crop">
      <div className="shell-container crop-hero">
        <div>
          <p className="eyebrow">Day 10 crop flow</p>
          <h2>Build a field-ready recommendation from location, soil, and nutrient inputs.</h2>
          <p className="hero-text">
            Signed in as {user?.name || "farmer"}. This form now submits to the protected Node crop API and renders the
            normalized ML-backed response shape inside the React app.
          </p>
        </div>
        <div className="surface-card crop-summary-card">
          <p className="card-kicker">What this screen covers</p>
          <ul className="compact-list">
            <li>Client-side validation aligned with the Node contract</li>
            <li>Protected request using your stored JWT token</li>
            <li>Primary crop and alternative recommendation cards</li>
            <li>Latency, source, and autofill metadata from the backend</li>
          </ul>
        </div>
      </div>

      <div className="shell-container crop-layout">
        <form className="surface-card crop-form-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <p className="card-kicker">Recommendation inputs</p>
              <h3>Farm profile</h3>
            </div>
            <p>Provide the same fields the backend validates so your first result is production-real, not mocked.</p>
          </div>

          <div className="field-grid field-grid-two">
            <label className="field">
              <span>Location mode</span>
              <select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value }))}>
                <option value="manual_location">Manual location</option>
                <option value="image_gps">Image GPS / coordinates</option>
              </select>
            </label>

            <label className="field">
              <span>Soil type</span>
              <select
                value={form.soilType}
                onChange={(event) => setForm((current) => ({ ...current, soilType: event.target.value }))}
              >
                {soilOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>District</span>
              <input
                type="text"
                value={form.district}
                onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))}
                placeholder="Bagalkot"
                required
              />
              {fieldErrors["location.district"] ? (
                <small className="field-hint field-hint-error">{fieldErrors["location.district"]}</small>
              ) : null}
            </label>

            <label className="field">
              <span>Taluk</span>
              <input
                type="text"
                value={form.taluk}
                onChange={(event) => setForm((current) => ({ ...current, taluk: event.target.value }))}
                placeholder="Jamkhandi"
                required
              />
              {fieldErrors["location.taluk"] ? (
                <small className="field-hint field-hint-error">{fieldErrors["location.taluk"]}</small>
              ) : null}
            </label>

            {form.mode === "image_gps" ? (
              <>
                <label className="field">
                  <span>Latitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.lat}
                    onChange={(event) => setForm((current) => ({ ...current, lat: event.target.value }))}
                    placeholder="16.154062"
                    required
                  />
                  {fieldErrors["location.lat"] ? (
                    <small className="field-hint field-hint-error">{fieldErrors["location.lat"]}</small>
                  ) : null}
                </label>

                <label className="field">
                  <span>Longitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.lng}
                    onChange={(event) => setForm((current) => ({ ...current, lng: event.target.value }))}
                    placeholder="75.658530"
                    required
                  />
                  {fieldErrors["location.lng"] ? (
                    <small className="field-hint field-hint-error">{fieldErrors["location.lng"]}</small>
                  ) : null}
                </label>
              </>
            ) : null}

            <label className="field">
              <span>Season</span>
              <select value={form.season} onChange={(event) => setForm((current) => ({ ...current, season: event.target.value }))}>
                {seasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="field checkbox-field">
              <span>Autofill marker</span>
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={form.autofillUsed}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, autofillUsed: event.target.checked }))
                  }
                />
                <span>Mark nutrient values as estimated from a saved source</span>
              </label>
            </div>
          </div>

          {form.autofillUsed ? (
            <div className="field-grid field-grid-two">
              <label className="field">
                <span>Autofill source</span>
                <select
                  value={form.autofillSource}
                  onChange={(event) => setForm((current) => ({ ...current, autofillSource: event.target.value }))}
                >
                  {autofillOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}

          <div className="section-heading">
            <div>
              <p className="card-kicker">Soil chemistry</p>
              <h3>Nutrient profile</h3>
            </div>
            <p>Use the same NPK and pH range limits enforced by the API.</p>
          </div>

          <div className="field-grid field-grid-four">
            <label className="field">
              <span>N</span>
              <input
                type="number"
                min="0"
                max="300"
                value={form.n}
                onChange={(event) => setForm((current) => ({ ...current, n: event.target.value }))}
              />
              {fieldErrors.n ? <small className="field-hint field-hint-error">{fieldErrors.n}</small> : null}
            </label>

            <label className="field">
              <span>P</span>
              <input
                type="number"
                min="0"
                max="300"
                value={form.p}
                onChange={(event) => setForm((current) => ({ ...current, p: event.target.value }))}
              />
              {fieldErrors.p ? <small className="field-hint field-hint-error">{fieldErrors.p}</small> : null}
            </label>

            <label className="field">
              <span>K</span>
              <input
                type="number"
                min="0"
                max="300"
                value={form.k}
                onChange={(event) => setForm((current) => ({ ...current, k: event.target.value }))}
              />
              {fieldErrors.k ? <small className="field-hint field-hint-error">{fieldErrors.k}</small> : null}
            </label>

            <label className="field">
              <span>pH</span>
              <input
                type="number"
                min="0"
                max="14"
                step="0.1"
                value={form.ph}
                onChange={(event) => setForm((current) => ({ ...current, ph: event.target.value }))}
              />
              {fieldErrors.ph ? <small className="field-hint field-hint-error">{fieldErrors.ph}</small> : null}
            </label>
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Generating recommendation..." : "Recommend crops"}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setForm(initialForm);
                setFieldErrors({});
                setErrorMessage("");
                setResult(null);
              }}
            >
              Reset form
            </button>
          </div>
        </form>

        <div className="results-column">
          {result ? (
            <div className="surface-card results-panel">
              <div className="section-heading">
                <div>
                  <p className="card-kicker">Recommendation result</p>
                  <h3>{result.primaryCrop?.name} looks strongest for this field.</h3>
                </div>
                <p>Query ID: {result.queryId}</p>
              </div>

              <CropResultCard title="Primary recommendation" crop={result.primaryCrop} featured />

              <div className="result-grid">
                {result.alternatives?.map((crop) => (
                  <CropResultCard key={crop.name} title="Alternative" crop={crop} />
                ))}
              </div>

              <div className="meta-grid">
                <article className="metric-card">
                  <span className="metric-label">Source</span>
                  <strong className="metric-value meta-value">{result.meta?.source || "Unknown"}</strong>
                  <p>Shows whether the result came from `ml-service` or a Node fallback path.</p>
                </article>
                <article className="metric-card muted">
                  <span className="metric-label">Latency</span>
                  <strong className="metric-value meta-value">{result.meta?.latencyMs ?? 0} ms</strong>
                  <p>Measured by the backend before it stored the recommendation audit record.</p>
                </article>
              </div>

              <div className="result-footnote">
                <span className="result-pill">{result.meta?.autofillUsed ? "Autofill flagged" : "Manual inputs"}</span>
                {result.meta?.fallbackUsed ? (
                  <span className="result-pill result-pill-warning">Fallback rules used</span>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="surface-card empty-state-card">
              <p className="card-kicker">Awaiting submission</p>
              <h3>Your recommendation will appear here.</h3>
              <p>
                Submit the protected crop form to view the primary crop, alternative options, backend latency, and
                source metadata returned by the new API flow.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CropPage;
