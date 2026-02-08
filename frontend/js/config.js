// JavaScript Configuration
// config.js

const CONFIG = {
    // Backend API URL - Change this for production
    // For local development: 'http://127.0.0.1:5000'
    // For production: 'https://your-production-url.com'
    // Backend API URL
    // Use empty string to make requests relative to the current domain (works for both local and prod if served by Flask)
    // Or use explicit URL if frontend is separate.
    API_BASE_URL: '',

    // Feature flags
    ENABLE_DEBUG: true
};

// Export for module usage (if using bundler) or Attach to window (if using script tags)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
