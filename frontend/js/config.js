// JavaScript Configuration
// config.js

const CONFIG = {
    // Backend API URL - Change this for production
    // For local development: 'http://127.0.0.1:5000'
    // For production: 'https://your-production-url.com'
    API_BASE_URL: 'http://127.0.0.1:5000',

    // Feature flags
    ENABLE_DEBUG: true
};

// Export for module usage (if using bundler) or Attach to window (if using script tags)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
