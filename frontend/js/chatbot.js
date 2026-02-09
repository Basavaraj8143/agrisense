// Chatbot Widget
import { getOpenRouterResponse } from './openrouter.js';

// Language configuration
const LANGUAGES = {
  en: { name: 'English', flag: '🇬🇧' },
  hi: { name: 'हिंदी', flag: '🇮🇳' },
  kn: { name: 'ಕನ್ನಡ', flag: '🇮🇳' }
};

// Default language
let currentLanguage = 'en';

// Deepgram API key handled by backend

(function () {
  // Language selector HTML for chat menu
  const languageSelectorHTML = `
    <div id="languageSelector" class="absolute top-4 right-16">
      <button id="languageToggle" class="text-gray-600 hover:text-gray-800">
        <span class="text-lg">🌐</span>
      </button>
      <div id="languageDropdown" class="hidden absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg py-1 z-50">
        ${Object.entries(LANGUAGES).map(([code, { name, flag }]) => `
          <button 
            data-lang="${code}"
            class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
          >
            <span>${flag} ${name}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;

  // Create chatbot widget HTML
  const chatbotHTML = `
    <div id="chatbotWidget" class="fixed bottom-6 right-6 z-50">
      <!-- Chatbot Button -->
      <button id="chatbotToggle" class="bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl transition-all transform hover:scale-110 focus:outline-none">
        <img src="images/chatbotlogo.webp" alt="Chatbot" class="w-10 h-10 rounded-full" />
      </button>

      <!-- Chatbot Window -->
      <div id="chatbotWindow" class="hidden absolute bottom-20 right-0 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-green-500">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <img src="images/chatbotlogo.webp" alt="AgriBot" class="w-10 h-10 rounded-full border-2 border-white" />
            <div>
              <h3 class="font-bold text-lg">AgriBot 🌾</h3>
              <p class="text-xs opacity-90">Your Farming Assistant</p>
            </div>
          </div>
          ${languageSelectorHTML}
          <button id="chatbotClose" class="text-white hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-all">
            <span class="text-2xl leading-none">×</span>
          </button>
        </div>

        <!-- Chat Messages -->
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          <!-- Welcome Message -->
          <div class="flex items-start space-x-2">
            <img src="images/chatbotlogo.webp" alt="Bot" class="w-8 h-8 rounded-full mt-1" />
            <div class="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
              <p class="text-sm text-gray-800">Hello! 👋 I'm AgriBot, your farming assistant. How can I help you today?</p>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div id="quickActions" class="px-4 py-2 bg-white border-t border-gray-200">
          <div class="flex flex-wrap gap-2">
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🌾 Crop Advice
            </button>
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🦠 Disease Help
            </button>
            <button class="quick-action-btn text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-2 rounded-full transition-all">
              🧪 Soil Testing
            </button>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex items-center space-x-2">
            <div class="relative flex-1">
              <input 
                type="text" 
                id="chatInput" 
                placeholder="Type or speak your message..." 
                class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button id="voiceInputBtn" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
            <button id="chatSend" class="bg-green-600 hover:bg-green-700 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all">
              <span class="text-xl">➤</span>
            </button>
          </div>
          <div id="voiceStatus" class="mt-2 text-xs text-center text-gray-500 hidden"></div>
        </div>

      </div>
    </div>
  `;

  function initChatbot() {
    // Add chatbot to the page
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // Initialize language selection
    const languageToggle = document.getElementById('languageToggle');
    const languageDropdown = document.getElementById('languageDropdown');
    const languageButtons = document.querySelectorAll('[data-lang]');

    // Toggle language dropdown
    languageToggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      languageDropdown.classList.toggle('hidden');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!languageDropdown.contains(e.target) && e.target !== languageToggle) {
        languageDropdown.classList.add('hidden');
      }
    });

    // Handle language selection
    languageButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        currentLanguage = button.dataset.lang;
        // Store language preference
        localStorage.setItem('chatbotLanguage', currentLanguage);
        // Close dropdown
        languageDropdown.classList.add('hidden');
        // Update UI to show selected language
        updateLanguageUI();
        // Send welcome message in selected language if it's a new chat
        if (chatMessages.children.length <= 1) { // Only if only the welcome message exists
          sendWelcomeMessage();
        }
      });
    });

    // Check for saved language preference
    const savedLanguage = localStorage.getItem('chatbotLanguage');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      currentLanguage = savedLanguage;
    }

    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const voiceStatus = document.getElementById('voiceStatus');
    const chatMessages = document.getElementById('chatMessages');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');

    // Speech-to-text variables
    let mediaRecorder;
    let audioChunks = [];

    // Add event listeners for voice input
    voiceInputBtn.addEventListener('mousedown', startRecording);
    voiceInputBtn.addEventListener('mouseup', stopRecording);
    voiceInputBtn.addEventListener('mouseleave', stopRecording);

    // For touch devices
    voiceInputBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      startRecording();
    });
    voiceInputBtn.addEventListener('touchend', stopRecording);

    async function transcribeAudio(audioBlob) {
      try {
        console.log('Sending audio to backend for transcription...');
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        const API_URL = (window.CONFIG?.API_BASE_URL !== undefined ? window.CONFIG.API_BASE_URL : 'http://127.0.0.1:5000') + '/api/transcribe';

        const response = await fetch(API_URL, {
          method: "POST",
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Backend Transcription Error:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          throw new Error(`Server request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log('Transcription response:', data);

        if (data?.results?.channels?.[0]?.alternatives?.[0]?.transcript) {
          const transcript = data.results.channels[0].alternatives[0].transcript;
          console.log('Transcription successful:', transcript);
          return transcript;
        } else {
          console.error('Unexpected response format:', data);
          return null;
        }
      } catch (error) {
        console.error('Error in transcribeAudio:', error);
        return null;
      }
    }

    async function startRecording() {
      try {
        console.log('Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('Microphone access granted');

        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          console.log('Audio data available');
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          console.log('Recording stopped, processing audio...');
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          voiceStatus.classList.add('hidden');
          voiceInputBtn.classList.remove('text-red-500');

          // Show typing indicator while transcribing
          const typingIndicator = document.createElement('div');
          typingIndicator.id = 'typing-indicator';
          typingIndicator.className = 'flex items-center space-x-1 my-2';
          typingIndicator.innerHTML = `
            <div class="typing-dot bg-green-400"></div>
            <div class="typing-dot bg-green-500"></div>
            <div class="typing-dot bg-green-600"></div>
          `;
          chatMessages.appendChild(typingIndicator);
          chatMessages.scrollTop = chatMessages.scrollHeight;

          try {
            // Transcribe the audio
            console.log('Sending audio for transcription...');
            const transcript = await transcribeAudio(audioBlob);
            const typingElement = document.getElementById('typing-indicator');
            if (typingElement) {
              chatMessages.removeChild(typingElement);
            }

            if (transcript) {
              console.log('Transcription successful, sending message...');
              sendMessage(transcript);
            } else {
              console.log('No transcript received from Deepgram');
              addMessageToChat("Sorry, I couldn't understand the audio. Please try again.", false);
            }
          } catch (error) {
            console.error('Error in transcription process:', error);
            addMessageToChat("There was an error processing your voice input. Please try again.", false);
          } finally {
            // Clean up the stream
            stream.getTracks().forEach(track => track.stop());
          }
        };

        // Set a timer to automatically stop recording after 10 seconds
        const maxRecordingTime = 10000; // 10 seconds
        const stopRecordingTimer = setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            console.log('Max recording time reached, stopping...');
            mediaRecorder.stop();
          }
        }, maxRecordingTime);

        mediaRecorder.start();
        console.log('Recording started');
        voiceStatus.classList.remove('hidden');
        voiceStatus.innerHTML = `
          <div class="flex items-center justify-center space-x-1">
            <span class="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span>Listening... Speak now</span>
          </div>
        `;
        voiceInputBtn.classList.add('text-red-500');
      } catch (error) {
        console.error('Error accessing microphone:', error);
        addMessageToChat("Couldn't access microphone. Please check your permissions and try again.", false);
      }
    }

    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        voiceStatus.classList.add('hidden');
        voiceInputBtn.classList.remove('text-red-500');

        // Stop all tracks in the stream
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    }

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
      const isOpening = chatbotWindow.classList.contains('hidden');
      chatbotWindow.classList.toggle('hidden');
      if (isOpening) {
        chatInput.focus();
        // Show welcome message if it's the first time opening
        if (chatMessages.children.length === 0) {
          sendWelcomeMessage();
        }
      }
    });

    chatbotClose.addEventListener('click', () => {
      chatbotWindow.classList.add('hidden');
    });

    function createMessageHTML(message, isUser = false) {
      if (isUser) {
        return `
          <div class="flex items-start space-x-2 justify-end">
            <div class="bg-green-600 text-white rounded-2xl rounded-tr-none p-3 shadow-sm max-w-[80%]">
              <p class="text-sm">${message}</p>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-start space-x-2">
            <img src="images/chatbotlogo.webp" alt="Bot" class="w-8 h-8 rounded-full mt-1" />
            <div class="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
              <p class="text-sm text-gray-800">${message}</p>
            </div>
          </div>
        `;
      }
    }

    function addMessageToChat(message, isUser = false) {
      const messageHTML = createMessageHTML(message, isUser);
      chatMessages.insertAdjacentHTML('beforeend', messageHTML);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function updateLanguageUI() {
      // Update any UI elements that show the current language
      const languageToggle = document.getElementById('languageToggle');
      if (languageToggle) {
        const currentLang = LANGUAGES[currentLanguage];
        languageToggle.innerHTML = `<span class="text-lg">${currentLang.flag}</span>`;
      }
    }

    async function sendWelcomeMessage() {
      const welcomeMessages = {
        en: "Hello! 👋 I'm AgriBot, your farming assistant. How can I help you today?",
        hi: "नमस्ते! 👋 मैं AgriBot हूँ, आपका कृषि सहायक। आज मैं आपकी कैसे मदद कर सकता हूँ?",
        kn: "ನಮಸ್ಕಾರ! 👋 ನಾನು AgriBot, ನಿಮ್ಮ ಕೃಷಿ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?"
      };

      // Clear existing messages
      chatMessages.innerHTML = '';
      // Add welcome message in selected language
      addMessageToChat(welcomeMessages[currentLanguage] || welcomeMessages.en);

      // Update UI to show selected language
      updateLanguageUI();
    }

    async function sendMessage(message) {
      if (!message.trim()) return;

      // Add user message to chat
      addMessageToChat(message, true);
      chatInput.value = '';

      // Show typing indicator
      const typingIndicator = document.createElement('div');
      typingIndicator.id = 'typing-indicator';
      typingIndicator.className = 'flex items-center space-x-1 my-2';
      typingIndicator.innerHTML = `
        <div class="typing-dot bg-green-400"></div>
        <div class="typing-dot bg-green-500"></div>
        <div class="typing-dot bg-green-600"></div>
      `;
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        const botResponse = await getBotResponse(message);
        // Remove typing indicator
        chatMessages.removeChild(typingIndicator);
        // Add bot response
        addMessageToChat(botResponse);
      } catch (error) {
        console.error('Error getting bot response:', error);
        chatMessages.removeChild(typingIndicator);
        addMessageToChat('Sorry, I encountered an error. Please try again.');
      }
    }

    chatSend.addEventListener('click', () => sendMessage(chatInput.value));

    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage(chatInput.value);
    });

    quickActionBtns.forEach(btn => {
      btn.addEventListener('click', () => sendMessage(btn.textContent.trim()));
    });

    let conversationHistory = [];
    const MAX_HISTORY_ITEMS = 10;

    async function getBotResponse(message) {
      // Add language instruction to the message
      const languageInstruction = {
        en: "Please respond in English.",
        hi: "कृपया हिंदी में उत्तर दें।",
        kn: "ದಯವಿಟ್ಟು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ."
      }[currentLanguage] || "Please respond in English.";

      const messageWithLanguage = `${message} (${languageInstruction})`;

      conversationHistory.push({
        role: 'user',
        parts: [{ text: messageWithLanguage }]
      });

      if (conversationHistory.length > MAX_HISTORY_ITEMS * 2) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY_ITEMS * 2);
      }

      const response = await getOpenRouterResponse(messageWithLanguage, conversationHistory);

      conversationHistory.push({
        role: 'model',
        parts: [{ text: response }]
      });

      return response;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }
})();
