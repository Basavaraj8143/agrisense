# AgriSense - AI Powered Smart Farming 🌱

**AgriSense** is a comprehensive, AI-driven agricultural platform designed to empower farmers with real-time insights, intelligent recommendations, and community support. It bridges the gap between traditional farming and modern technology, ensuring better yields, sustainable practices, and improved profitability.

![AgriSense Hero](https://images.unsplash.com/photo-1625246333195-5512a67a9981?auto=format&fit=crop&q=80&w=2000)

## 🌟 Key Features

AgriSense offers a wide array of tools tailored for the modern farmer:

### 🧠 AI & Machine Learning Core
*   **Targeted Crop Recommendation**: Uses Random Forest algorithms to suggest the most suitable crops based on NPK levels, pH, rainfall, temperature, and location.
*   **Smart NPK Auto-Fill**: Automatically fetches average soil nutrient profiles for districts in North Karnataka, simplifying data entry.
*   **Pest & Disease Detection**: Upload photos of affected crops to instantly identify diseases or pests and receive organic/chemical treatment advice.
*   **AI Farming Assistant**: A 24/7 Chatbot powered by LLMs (OpenRouter) capable of answering complex farming queries in real-time.
*   **Voice-First Interface**: integrated with **Deepgram** for high-accuracy voice-to-text, allowing farmers to interact with the app using voice commands in their native language.

### 🚜 Farming Tools
*   **Profit & Loss Calculator**: A dedicated financial tool to track farming expenses (seeds, fertilizers, labor) vs. revenue, helping farmers analyze their profit margins.
*   **Soil Testing Kit**: Integrated service to request affordable soil testing kits directly to the farm.
*   **Crop Calendar**: Customized schedules for sowing, irrigation, and harvesting based on the selected crop and season.
*   **Fertilizer Guide**: Detailed instructions on fertilizer application rates and methods.

### 🌐 Information & Community
*   **Real-time Market Prices**: Live updates on crop prices in various markets (APMC) to ensure fair trade.
*   **Government Schemes**: A curated list of agricultural subsidies and government welfare schemes with application details.
*   **Helpline Directory**: Direct access to Kisan Call Centers and State Agriculture Departments.
*   **Learning Hub**: A repository of farming tutorials, guides, and best practices.
*   **Community Forum**: A platform for farmers to connect, share success stories, upload photos, and ask for peer advice.

### 📱 Accessibility & Design
*   **Multilingual Support**: Fully localized in **English**, **Hindi (हिंदी)**, and **Kannada (ಕನ್ನಡ)**.
*   **Offline Capability**: Designed to work partially offline in low-connectivity rural areas.
*   **Responsive UI**: Built with **Tailwind CSS** for a seamless experience on mobile devices and desktops.

## 🛠️ Technology Stack

*   **Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript (Modular ES6 architecture)
*   **Backend**: Python, Flask (REST API)
*   **Machine Learning**: Scikit-Learn (Random Forest), Pandas, NumPy
*   **AI Services**: 
    *   **OpenRouter** (LLM for Chatbot)
    *   **Deepgram** (Voice Transcription)
*   **Deployment**: Ready for Render/Heroku (Gunicorn WSGI)

## 📂 Project Structure

```
agrisense/
├── backend/
│   ├── app.py               # Main Application Server (Flask)
│   ├── model/               # Serialized ML Models (.pkl)
│   ├── data/                # Datasets (Soil averages, Crop content)
│   └── requirements.txt     # Python Dependencies
├── frontend/
│   ├── index.html           # Landing Home Page
│   ├── crop-recommendation.html  # Prediction Tool
│   ├── pest-detection.html  # Image Analysis Tool
│   ├── profit-loss.html     # Calculator Tool
│   ├── community.html       # Social Forum
│   ├── js/
│   │   ├── config.js        # API Configuration
│   │   ├── common.js        # Shared Navigation & Validations
│   │   └── chatbot.js       # AI Chat Logic
│   └── ... (other pages)
└── README.md                # Documentation
```

## 🚀 Getting Started

### Prerequisites
*   Python 3.8+
*   Git

### Local Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/Basavaraj8143/agrisense.git
    cd agrisense
    ```

2.  **Set up Virtual Environment**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies**
    ```bash
    pip install -r backend/requirements.txt
    ```

4.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```ini
    DEEPGRAM_API_KEY=your_deepgram_key_here
    OPENROUTER_API_KEY=your_openrouter_key_here
    FLASK_DEBUG=True
    ```

5.  **Run the Application**
    ```bash
    python backend/app.py
    ```
    Access the app at `http://localhost:5000`

## 🌍 Deployment

The project is configured for easy deployment on **Render**.

1.  Push code to GitHub.
2.  Create a new Web Service on Render linked to your repo.
3.  **Build Command**: `pip install -r backend/requirements.txt`
4.  **Start Command**: `gunicorn --chdir backend app:app`
5.  Add your API keys in the environment variables settings.

## 🤝 Contributing

We welcome contributions!
1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Empowering Farmers, One Click at a Time.* 🌾
