import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { cropApi, pestApi, profileApi, toFieldErrors } from "../lib/api-client";

const languageLabels = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
};

const soilTypes = [
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

function getInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AS";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatProvider(provider) {
  if (!provider) {
    return "Unknown";
  }

  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function ProfilePage() {
  const { token, user, logout, updateUser } = useAuth();
  const [cropItems, setCropItems] = useState([]);
  const [pestItems, setPestItems] = useState([]);
  const [status, setStatus] = useState("loading");

  // Profile Form Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    preferredLanguage: "en",
    phone: "",
    location: "",
    farmSizeAcres: "",
    defaultSoilType: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Changing State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function loadSummary() {
      setStatus("loading");

      try {
        const [nextCropItems, nextPestItems] = await Promise.all([
          cropApi.history(token, 6),
          pestApi.history(token, 6),
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

    loadSummary();

    return () => {
      isCancelled = true;
    };
  }, [token]);

  // Sync user context data into local profile form edit state when edit mode is opened
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        preferredLanguage: user.preferredLanguage || "en",
        phone: user.phone || "",
        location: user.location || "",
        farmSizeAcres: user.farmSizeAcres !== null && user.farmSizeAcres !== undefined ? String(user.farmSizeAcres) : "",
        defaultSoilType: user.defaultSoilType || "",
      });
    }
  }, [user, isEditing]);

  const stats = useMemo(
    () => [
      { label: "Recent Crop Runs", value: cropItems.length, accent: "accent-green" },
      { label: "Recent Pest Checks", value: pestItems.length, accent: "accent-blue" },
      { label: "Preferred Language", value: languageLabels[user?.preferredLanguage] || "English", accent: "accent-purple" },
      { label: "Account Type", value: formatProvider(user?.authProvider), accent: "accent-orange" },
    ],
    [cropItems.length, pestItems.length, user?.preferredLanguage, user?.authProvider]
  );

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileErrors({});
    setProfileSuccess("");
    setProfileSaving(true);

    try {
      const payload = {
        name: profileForm.name.trim(),
        preferredLanguage: profileForm.preferredLanguage,
        phone: profileForm.phone.trim() || null,
        location: profileForm.location.trim() || null,
        farmSizeAcres: profileForm.farmSizeAcres ? parseFloat(profileForm.farmSizeAcres) : null,
        defaultSoilType: profileForm.defaultSoilType || null,
      };

      const response = await profileApi.updateProfile(payload, token);
      updateUser(response);
      setProfileSuccess("Profile details updated successfully!");
      setIsEditing(false);
    } catch (error) {
      if (error.details) {
        setProfileErrors(toFieldErrors(error.details));
      } else {
        setProfileErrors({ global: error.message || "Failed to update profile." });
      }
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setPasswordSaving(true);

    try {
      const payload = {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      };

      await profileApi.changePassword(payload, token);
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      if (error.details) {
        setPasswordErrors(toFieldErrors(error.details));
      } else {
        setPasswordErrors({ global: error.message || "Failed to change password." });
      }
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <section className="legacy-profile-page">
      <div className="legacy-dashboard-hero legacy-profile-hero">
        <div className="legacy-container legacy-profile-hero-inner">
          <div className="legacy-profile-avatar">{getInitials(user?.name)}</div>
          <div>
            <h2 className="legacy-dashboard-title">Your Profile</h2>
            <p className="legacy-dashboard-subtitle">
              Review and manage your AgriSense account details, farming configuration, and security settings.
            </p>
          </div>
        </div>
      </div>

      <div className="legacy-section">
        <div className="legacy-container">
          <div className="legacy-profile-grid">
            <article className="legacy-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 className="legacy-card-title" style={{ margin: 0 }}>Account Details</h3>
                {!isEditing && (
                  <button
                    type="button"
                    className="legacy-outline-button legacy-header-button"
                    onClick={() => {
                      setIsEditing(true);
                      setProfileErrors({});
                      setProfileSuccess("");
                    }}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {profileSuccess && (
                <div className="legacy-assist-panel tone-success" style={{ margin: "0 0 1rem 0" }}>
                  <p>{profileSuccess}</p>
                </div>
              )}

              {profileErrors.global && (
                <div className="legacy-error-box">
                  {profileErrors.global}
                </div>
              )}

              {!isEditing ? (
                <div className="legacy-profile-details">
                  <div className="legacy-profile-row">
                    <span>Name</span>
                    <strong>{user?.name || "Unknown user"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Email</span>
                    <strong>{user?.email || "Not available"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Phone</span>
                    <strong>{user?.phone || "Not provided"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Location / Village</span>
                    <strong>{user?.location || "Not provided"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Farm Size (Acres)</span>
                    <strong>{user?.farmSizeAcres !== null && user?.farmSizeAcres !== undefined ? `${user.farmSizeAcres} Acres` : "Not provided"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Default Soil Type</span>
                    <strong>{user?.defaultSoilType ? user.defaultSoilType.charAt(0).toUpperCase() + user.defaultSoilType.slice(1) : "Not provided"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Preferred Language</span>
                    <strong>{languageLabels[user?.preferredLanguage] || "English"}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Provider</span>
                    <strong>{formatProvider(user?.authProvider)}</strong>
                  </div>
                  <div className="legacy-profile-row">
                    <span>Role</span>
                    <strong>{user?.role || "farmer"}</strong>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="legacy-list">
                  <div className="legacy-field">
                    <label className="legacy-field-label">Name</label>
                    <input
                      type="text"
                      className="legacy-input"
                      required
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    {profileErrors.name && <span className="legacy-field-error">{profileErrors.name}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Phone Number</label>
                    <input
                      type="tel"
                      className="legacy-input"
                      placeholder="e.g. +91XXXXXXXXXX"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    {profileErrors.phone && <span className="legacy-field-error">{profileErrors.phone}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Location / Village</label>
                    <input
                      type="text"
                      className="legacy-input"
                      placeholder="e.g. Jamkhandi"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, location: e.target.value }))}
                    />
                    {profileErrors.location && <span className="legacy-field-error">{profileErrors.location}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Farm Size (Acres)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="legacy-input"
                      placeholder="e.g. 4.5"
                      value={profileForm.farmSizeAcres}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, farmSizeAcres: e.target.value }))}
                    />
                    {profileErrors.farmSizeAcres && <span className="legacy-field-error">{profileErrors.farmSizeAcres}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Default Soil Type</label>
                    <select
                      className="legacy-input"
                      value={profileForm.defaultSoilType}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, defaultSoilType: e.target.value }))}
                    >
                      <option value="">Select Soil Type</option>
                      {soilTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {profileErrors.defaultSoilType && <span className="legacy-field-error">{profileErrors.defaultSoilType}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Preferred Language</label>
                    <select
                      className="legacy-input"
                      value={profileForm.preferredLanguage}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, preferredLanguage: e.target.value }))}
                    >
                      {Object.entries(languageLabels).map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                    {profileErrors.preferredLanguage && <span className="legacy-field-error">{profileErrors.preferredLanguage}</span>}
                  </div>

                  <div className="legacy-button-row">
                    <button
                      type="submit"
                      className="legacy-solid-button"
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="legacy-outline-button"
                      onClick={() => setIsEditing(false)}
                      disabled={profileSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </article>

            <article className="legacy-card">
              <h3 className="legacy-card-title">Security & Password</h3>
              
              {user?.authProvider === "google" ? (
                <div className="legacy-assist-panel tone-neutral" style={{ margin: "0 0 1rem 0" }}>
                  <p>Your account is managed via Google Sign-In. Password updates cannot be modified locally.</p>
                </div>
              ) : (
                <form onSubmit={handlePasswordSave} className="legacy-list">
                  {passwordSuccess && (
                    <div className="legacy-assist-panel tone-success" style={{ margin: "0 0 1rem 0" }}>
                      <p>{passwordSuccess}</p>
                    </div>
                  )}

                  {passwordErrors.global && (
                    <div className="legacy-error-box">
                      {passwordErrors.global}
                    </div>
                  )}

                  <div className="legacy-field">
                    <label className="legacy-field-label">Current Password</label>
                    <input
                      type="password"
                      className="legacy-input"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    {passwordErrors.currentPassword && <span className="legacy-field-error">{passwordErrors.currentPassword}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">New Password</label>
                    <input
                      type="password"
                      className="legacy-input"
                      required
                      value={passwordForm.newPassword}
                      placeholder="Min 8 chars, 1 upper, 1 lower, 1 digit"
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                    {passwordErrors.newPassword && <span className="legacy-field-error">{passwordErrors.newPassword}</span>}
                  </div>

                  <div className="legacy-field">
                    <label className="legacy-field-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="legacy-input"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                    {passwordErrors.confirmPassword && <span className="legacy-field-error">{passwordErrors.confirmPassword}</span>}
                  </div>

                  <button
                    type="submit"
                    className="legacy-solid-button legacy-full-width"
                    disabled={passwordSaving}
                    style={{ marginTop: "0.5rem" }}
                  >
                    {passwordSaving ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              )}

              <div className="legacy-profile-status-card" style={{ marginTop: "1.5rem" }}>
                <h4 className="legacy-panel-title">Quick Actions</h4>
                <div className="legacy-profile-actions" style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
                  <Link to="/crop" className="legacy-outline-button legacy-full-width">
                    New Crop Recommendation
                  </Link>
                  <Link to="/pest" className="legacy-outline-button legacy-full-width">
                    New Pest Detection
                  </Link>
                  <Link to="/dashboard" className="legacy-outline-button legacy-full-width">
                    Open Dashboard
                  </Link>
                  <button type="button" className="legacy-text-button legacy-full-width legacy-signout-text" onClick={logout} style={{ color: "#dc2626" }}>
                    Sign out of this account
                  </button>
                </div>
              </div>
            </article>
          </div>

          <div className="legacy-stats-grid">
            {stats.map((item) => (
              <article key={item.label} className={`legacy-stat-card ${item.accent}`}>
                <div className="legacy-stat-value legacy-stat-value-small">{item.value}</div>
                <div className="legacy-stat-label">{item.label}</div>
              </article>
            ))}
          </div>

          <div className="legacy-profile-grid legacy-profile-lower-grid">
            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Crop Activity</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading crop activity...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load crop activity right now.</p> : null}
              {status === "ready" && cropItems.length === 0 ? (
                <p className="legacy-card-copy">No crop recommendations saved yet.</p>
              ) : null}
              {status === "ready" && cropItems.length > 0 ? (
                <div className="legacy-mini-list">
                  {cropItems.map((item) => (
                    <div key={item.id} className="legacy-mini-item">
                      <strong>{item.primaryCrop?.name || "Unknown crop"}</strong>
                      <span>{item.location?.district || "Unknown district"}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>

            <article className="legacy-card">
              <h3 className="legacy-card-title">Recent Pest Activity</h3>
              {status === "loading" ? <p className="legacy-card-copy">Loading pest activity...</p> : null}
              {status === "error" ? <p className="legacy-card-copy">Unable to load pest activity right now.</p> : null}
              {status === "ready" && pestItems.length === 0 ? (
                <p className="legacy-card-copy">No pest detections saved yet.</p>
              ) : null}
              {status === "ready" && pestItems.length > 0 ? (
                <div className="legacy-mini-list">
                  {pestItems.map((item) => (
                    <div key={item.id} className="legacy-mini-item">
                      <strong>{item.result?.scientificName || "Unknown pest"}</strong>
                      <span>{item.result?.confidencePercent ?? 0}% confidence</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
