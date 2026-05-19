import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { ApiError, cropApi, toFieldErrors } from "../lib/api-client";
import { extractCoordinatesFromImage, reverseGeocodeCoordinates } from "../lib/image-location";

const initialForm = {
  locationMethod: "image_upload",
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

function hasCoordinates(form) {
  return form.lat !== "" && form.lng !== "" && !Number.isNaN(Number(form.lat)) && !Number.isNaN(Number(form.lng));
}

function validateCropForm(form) {
  const errors = {};

  if (form.locationMethod === "image_upload" && !form.locationImage) {
    errors.locationImage = "Upload a field image or switch to manual location entry.";
  }

  if (form.district.trim().length < 2) {
    errors["location.district"] = "District is required.";
  }

  if (form.taluk.trim().length < 2) {
    errors["location.taluk"] = "Taluk is required.";
  }

  if (hasCoordinates(form)) {
    const lat = Number(form.lat);
    const lng = Number(form.lng);

    if (lat < -90 || lat > 90) {
      errors["location.lat"] = "Latitude must be between -90 and 90.";
    }

    if (lng < -180 || lng > 180) {
      errors["location.lng"] = "Longitude must be between -180 and 180.";
    }
  } else if (form.locationMethod === "image_upload" && (form.lat !== "" || form.lng !== "")) {
    errors["location.lat"] = "Provide both latitude and longitude, or leave both blank.";
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
      mode: hasCoordinates(form) ? "image_gps" : "manual_location",
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

  if (hasCoordinates(form)) {
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
  const [form, setForm] = useState(() => ({ ...initialForm, locationImage: null }));
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [locationStatus, setLocationStatus] = useState("");
  const [geolocating, setGeolocating] = useState(false);
  const [extractingLocation, setExtractingLocation] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!form.locationImage) {
      setImagePreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(form.locationImage);
    setImagePreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.locationImage]);

  function updateForm(updater) {
    setForm((current) => {
      const nextValue = typeof updater === "function" ? updater(current) : updater;
      return nextValue;
    });
  }

  async function autofillLocationFromCoordinates(lat, lng, sourceLabel) {
    updateForm((current) => ({
      ...current,
      lat: lat.toFixed(6),
      lng: lng.toFixed(6),
    }));

    setLocationStatus(`Coordinates extracted from ${sourceLabel}. Resolving district and taluk...`);

    try {
      const location = await reverseGeocodeCoordinates(lat, lng);
      updateForm((current) => ({
        ...current,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        district: location.district || current.district,
        taluk: location.taluk || current.taluk,
      }));

      if (location.label) {
        setLocationStatus(`Coordinates detected from ${sourceLabel}. Autofilled location: ${location.label}.`);
      } else {
        setLocationStatus(`Coordinates detected from ${sourceLabel}. Please confirm district and taluk manually.`);
      }
    } catch {
      setLocationStatus(`Coordinates detected from ${sourceLabel}. Please confirm district and taluk manually.`);
    }
  }

  async function handleImageChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFieldErrors((current) => ({ ...current, locationImage: undefined }));
    setLocationStatus("");

    if (!nextFile) {
      updateForm((current) => ({ ...current, locationImage: null }));
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      updateForm((current) => ({ ...current, locationImage: null }));
      setFieldErrors((current) => ({ ...current, locationImage: "Please choose an image file." }));
      return;
    }

    updateForm((current) => ({ ...current, locationImage: nextFile }));
    setExtractingLocation(true);

    try {
      const coordinates = await extractCoordinatesFromImage(nextFile, (status) => setLocationStatus(status));

      if (!coordinates) {
        setLocationStatus("No coordinates were found in the image. You can still enter location manually or use current location.");
        return;
      }

      await autofillLocationFromCoordinates(
        coordinates.lat,
        coordinates.lng,
        coordinates.source === "exif" ? "image GPS metadata" : "OCR text"
      );
    } catch {
      setLocationStatus("Could not extract coordinates from this image. You can still continue with manual location entry.");
    } finally {
      setExtractingLocation(false);
    }
  }

  async function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Device geolocation is not available in this browser.");
      return;
    }

    setGeolocating(true);
    setLocationStatus("Getting your current device coordinates...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await autofillLocationFromCoordinates(position.coords.latitude, position.coords.longitude, "device location");
        setGeolocating(false);
      },
      () => {
        setLocationStatus("Unable to access device location. You can still continue by entering district and taluk.");
        setGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  }

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

  function resetForm() {
    setForm({ ...initialForm, locationImage: null });
    setImagePreviewUrl("");
    setLocationStatus("");
    setFieldErrors({});
    setErrorMessage("");
    setResult(null);
  }

  return (
    <section className="page page-crop">
      <div className="shell-container crop-hero">
        <div>
          <p className="eyebrow">Crop recommendation</p>
          <h2>Upload a field image or enter your location manually before building the recommendation.</h2>
          <p className="hero-text">
            Signed in as {user?.name || "farmer"}. This flow now supports the legacy-style image-first entry while still
            keeping a direct manual location option for faster use.
          </p>
        </div>
        <div className="surface-card crop-summary-card">
          <p className="card-kicker">What this screen covers</p>
          <ul className="compact-list">
            <li>Image-assisted or manual location entry</li>
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
              <h3>Location and field profile</h3>
            </div>
            <p>Choose the input path that matches how the farmer actually starts the workflow.</p>
          </div>

          <div className="location-mode-grid">
            <button
              type="button"
              className={`location-mode-card ${form.locationMethod === "image_upload" ? "is-active" : ""}`}
              onClick={() => updateForm((current) => ({ ...current, locationMethod: "image_upload" }))}
            >
              <span className="location-mode-title">Upload field image</span>
              <span className="location-mode-copy">Start with a field photo, then confirm location details below.</span>
            </button>

            <button
              type="button"
              className={`location-mode-card ${form.locationMethod === "manual_location" ? "is-active" : ""}`}
              onClick={() =>
                updateForm((current) => ({
                  ...current,
                  locationMethod: "manual_location",
                  locationImage: null,
                  lat: "",
                  lng: "",
                }))
              }
            >
              <span className="location-mode-title">Enter location manually</span>
              <span className="location-mode-copy">Skip the image and provide district and taluk directly.</span>
            </button>
          </div>

          {form.locationMethod === "image_upload" ? (
            <div className="location-assist-block">
              <label className="upload-dropzone">
                <input type="file" accept="image/*" onChange={handleImageChange} />
                <span className="upload-title">{form.locationImage ? form.locationImage.name : "Choose a field image"}</span>
                <span className="upload-subtitle">We will try GPS metadata first, then OCR text, and autofill the location fields if coordinates are found.</span>
              </label>

              {fieldErrors.locationImage ? <p className="form-error">{fieldErrors.locationImage}</p> : null}

              {imagePreviewUrl ? (
                <div className="image-preview-card">
                  <img src={imagePreviewUrl} alt="Field image preview" className="image-preview" />
                </div>
              ) : null}

              <div className="location-helper-card">
                <div>
                  <p className="card-kicker">Optional coordinates</p>
                  <p className="helper-copy">
                    If image extraction fails, you can still use current device coordinates or type district and taluk yourself.
                  </p>
                </div>
                <button
                  type="button"
                  className="secondary-button inline-button"
                  onClick={handleUseCurrentLocation}
                  disabled={geolocating || extractingLocation}
                >
                  {geolocating ? "Getting location..." : "Use current location"}
                </button>
              </div>

              {locationStatus ? <p className="field-hint status-note">{locationStatus}</p> : null}

              <div className="field-grid field-grid-two">
                <label className="field">
                  <span>Latitude</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={form.lat}
                    onChange={(event) => updateForm((current) => ({ ...current, lat: event.target.value }))}
                    placeholder="16.154062"
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
                    onChange={(event) => updateForm((current) => ({ ...current, lng: event.target.value }))}
                    placeholder="75.658530"
                  />
                  {fieldErrors["location.lng"] ? (
                    <small className="field-hint field-hint-error">{fieldErrors["location.lng"]}</small>
                  ) : null}
                </label>
              </div>
            </div>
          ) : null}

          <div className="field-grid field-grid-two">
            <label className="field">
              <span>District</span>
              <input
                type="text"
                value={form.district}
                onChange={(event) => updateForm((current) => ({ ...current, district: event.target.value }))}
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
                onChange={(event) => updateForm((current) => ({ ...current, taluk: event.target.value }))}
                placeholder="Jamkhandi"
                required
              />
              {fieldErrors["location.taluk"] ? (
                <small className="field-hint field-hint-error">{fieldErrors["location.taluk"]}</small>
              ) : null}
            </label>

            <label className="field">
              <span>Soil type</span>
              <select value={form.soilType} onChange={(event) => updateForm((current) => ({ ...current, soilType: event.target.value }))}>
                {soilOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Season</span>
              <select value={form.season} onChange={(event) => updateForm((current) => ({ ...current, season: event.target.value }))}>
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
                  onChange={(event) => updateForm((current) => ({ ...current, autofillUsed: event.target.checked }))}
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
                  onChange={(event) => updateForm((current) => ({ ...current, autofillSource: event.target.value }))}
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
                onChange={(event) => updateForm((current) => ({ ...current, n: event.target.value }))}
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
                onChange={(event) => updateForm((current) => ({ ...current, p: event.target.value }))}
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
                onChange={(event) => updateForm((current) => ({ ...current, k: event.target.value }))}
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
                onChange={(event) => updateForm((current) => ({ ...current, ph: event.target.value }))}
              />
              {fieldErrors.ph ? <small className="field-hint field-hint-error">{fieldErrors.ph}</small> : null}
            </label>
          </div>

          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

          <div className="form-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Generating recommendation..." : extractingLocation ? "Finishing image extraction..." : "Recommend crops"}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
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
                Upload a field image or enter the location manually, then submit the crop form to see the recommendation
                cards and backend metadata.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CropPage;
