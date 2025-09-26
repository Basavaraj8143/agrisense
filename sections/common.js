// Shared language toggle and translation utility for standalone pages
(function () {
  const translations = {
    en: {
      'nav-home': 'Home',
      'nav-crop': 'Crop Recommendation',
      'nav-disease': 'Disease Detection',
      'nav-dashboard': 'Dashboard',
      'nav-about': 'About',
      'nav-contact': 'Contact',
      'hero-title': 'Smart Farming Powered by AI',
      'hero-subtitle': 'Revolutionizing agriculture with intelligent crop recommendations and disease detection',
      'cta-button': 'Get Crop Advice 🌾',
      'features-title': 'Our AI-Powered Solutions',
      'features-subtitle': 'Empowering farmers with cutting-edge technology for better yields and sustainable farming',
      'crop-rec-title': 'AI Crop Recommendation',
      'disease-title': 'Plant Disease Detection',
      'dashboard-title': 'Agricultural Dashboard',
      'contact-title': 'Contact Us',
      'about-title': 'About AgriSense'
    },
    hi: {
      'nav-home': 'होम',
      'nav-crop': 'फसल सिफारिश',
      'nav-disease': 'रोग निदान',
      'nav-dashboard': 'डैशबोर्ड',
      'nav-about': 'के बारे में',
      'nav-contact': 'संपर्क',
      'hero-title': 'एआई द्वारा संचालित स्मार्ट खेती',
      'hero-subtitle': 'बुद्धिमान फसल सिफारिशों और रोग निदान के साथ कृषि में क्रांति',
      'cta-button': 'फसल सलाह प्राप्त करें 🌾',
      'features-title': 'हमारे एआई-संचालित समाधान',
      'features-subtitle': 'बेहतर उत्पादन और टिकाऊ खेती के लिए अत्याधुनिक तकनीक से किसानों को सशक्त बनाना',
      'crop-rec-title': 'एआई फसल सिफारिश',
      'disease-title': 'पौध रोग पहचान',
      'dashboard-title': 'कृषि डैशबोर्ड',
      'contact-title': 'संपर्क करें',
      'about-title': 'एग्रीसेंस के बारे में'
    },
    kn: {
      'nav-home': 'ಮುಖ್ಯ',
      'nav-crop': 'ಬೆಳೆ ಶಿಫಾರಸು',
      'nav-disease': 'ರೋಗ ಪತ್ತೆ',
      'nav-dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'nav-about': 'ಬಗ್ಗೆ',
      'nav-contact': 'ಸಂಪರ್ಕ',
      'hero-title': 'AI ನಿಂದ ಚಾಲಿತ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ',
      'hero-subtitle': ' ಬೆಳೆ ಶಿಫಾರಸುಗಳು ಮತ್ತು ರೋಗ ಪತ್ತೆಯೊಂದಿಗೆ ಕೃಷಿಯಲ್ಲಿ ಕ್ರಾಂತಿ',
      'cta-button': 'ಬೆಳೆ ಸಲಹೆ ಪಡೆಯಿರಿ 🌾',
      'features-title': 'ನಮ್ಮ AI-ಚಾಲಿತ ಪರಿಹಾರಗಳು',
      'features-subtitle': 'ಉತ್ತಮ ಇಳುವರಿ ಮತ್ತು ಸುಸ್ಥಿರ ಕೃಷಿಗಾಗಿ ರೈತರನ್ನು ತಂತ್ರಜ್ಞಾನದಿಂದ ಸಬಲೀಕರಿಸುವುದು',
      'crop-rec-title': 'AI ಬೆಳೆ ಶಿಫಾರಸು',
      'disease-title': 'ಸಸ್ಯ ರೋಗ ಪತ್ತೆ',
      'dashboard-title': 'ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      'contact-title': 'ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'about-title': 'ಆಗ್ರಿಸೆನ್ಸ್ ಬಗ್ಗೆ'
    }
  };

  const storageKey = 'agrisense_lang';
  let currentLanguage = localStorage.getItem(storageKey) || 'en';

  function translatePage(lang) {
    const dict = translations[lang] || translations.en;
    document.querySelectorAll('[data-translate]').forEach(el => {
      const key = el.getAttribute('data-translate');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  }

  function initLanguage() {
    const select = document.getElementById('languageSelect');
    if (select) {
      select.value = currentLanguage;
      select.addEventListener('change', function () {
        currentLanguage = this.value;
        localStorage.setItem(storageKey, currentLanguage);
        translatePage(currentLanguage);
      });
    }
    translatePage(currentLanguage);
  }

  document.addEventListener('DOMContentLoaded', initLanguage);
})();
