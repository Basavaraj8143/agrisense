# AgriSense — AI-Powered Smart Farming 🌱

> Bridging traditional farming with modern intelligence. Real-time insights, crop recommendations, pest detection, and community support — built for the farmers of India.

![Python](https://img.shields.io/badge/Python-3.8+-3d7a3d?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-REST_API-1a2f1a?style=flat-square&logo=flask&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Random_Forest-f7931e?style=flat-square&logo=scikit-learn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-7dc45a?style=flat-square)
![Status](https://img.shields.io/badge/Rebuild-Active-7dc45a?style=flat-square)

---

## Table of Contents

- [AgriSense — AI-Powered Smart Farming 🌱](#agrisense--ai-powered-smart-farming-)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Rebuild Roadmap](#rebuild-roadmap)
  - [Features](#features)
    - [🧠 AI \& ML Core](#-ai--ml-core)
    - [🚜 Farming Tools](#-farming-tools)
    - [📊 Market \& Government](#-market--government)
    - [🌐 Community \& Learning](#-community--learning)
    - [📱 Accessibility](#-accessibility)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [License](#license)

---

## Overview

AgriSense is a comprehensive agricultural platform that empowers farmers with AI-driven crop recommendations, pest & disease detection, live market prices, and a multilingual voice-first interface. It is designed to work in low-connectivity rural environments across India, with full support for English, Hindi, and Kannada.

---

## Rebuild Roadmap

The repository is currently undergoing a staged migration to a backend-focused production architecture.

| Service | Directory | Stack | Status |
|---|---|---|---|
| Main API | `backend-node/` | Node.js + Express | 🔄 In progress |
| Frontend | `frontend/` | React | 🔄 Migrating |
| ML Inference | `ml-service/` | Python | 🔄 In progress |
| Planning & Contracts | `coreplan.md`, `shared-docs/` | — | 📋 Active |

The legacy `backend/` (Flask) and original `frontend/` remain available during migration.

---

## Features

### 🧠 AI & ML Core

- **Crop Recommendation** — Random Forest model trained on NPK levels, pH, rainfall, temperature, and location data to suggest the most suitable crop.
- **Smart NPK Auto-Fill** — Automatically fetches average soil nutrient profiles for districts in North Karnataka.
- **Pest & Disease Detection** — Upload a photo of an affected crop to identify diseases or pests and receive organic/chemical treatment advice.
- **AI Farming Assistant** — 24/7 chatbot powered by LLMs via OpenRouter for complex farming queries.
- **Voice-First Interface** — Deepgram-integrated voice-to-text in the farmer's native language.

### 🚜 Farming Tools

- **Profit & Loss Calculator** — Track seeds, fertilizers, and labor costs against revenue to analyze margins.
- **Soil Testing Kit** — Request an affordable soil testing kit directly to the farm.
- **Crop Calendar** — Sowing, irrigation, and harvesting schedules customized per crop and season.
- **Fertilizer Guide** — Detailed application rates and methods per crop type.

### 📊 Market & Government

- **Live Market Prices** — Real-time APMC crop price updates to ensure fair trade.
- **Government Schemes** — Curated list of agricultural subsidies and welfare schemes with application details.
- **Helpline Directory** — Direct access to Kisan Call Centers and State Agriculture Departments.

### 🌐 Community & Learning

- **Community Forum** — Farmers connect, share stories, upload photos, and seek peer advice.
- **Learning Hub** — Repository of farming tutorials, guides, and best practices.

### 📱 Accessibility

- **Multilingual** — Fully localized in English, Hindi (हिंदी), and Kannada (ಕನ್ನಡ).
- **Offline Capability** — Partial offline mode for low-connectivity rural areas.
- **Responsive UI** — Mobile-first design built with Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Tailwind CSS, Vanilla JS (Modular ES6) |
| Backend | Python, Flask (REST API) |
| Machine Learning | Scikit-Learn (Random Forest), Pandas, NumPy |
| LLM / Chatbot | OpenRouter |
| Voice Transcription | Deepgram |
| Deployment | Render / Heroku (Gunicorn WSGI) |

---

## Project Structure

```
agrisense/
├── backend/
│   ├── app.py                    # Flask application server
│   ├── model/                    # Serialized ML models (.pkl)
│   ├── data/                     # Soil averages, crop content datasets
│   └── requirements.txt
├── frontend/
│   ├── index.html                # Landing page
│   ├── crop-recommendation.html
│   ├── pest-detection.html
│   ├── profit-loss.html
│   ├── community.html
│   └── js/
│       ├── config.js             # API configuration
│       ├── common.js             # Shared navigation & validations
│       └── chatbot.js            # AI chat logic
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.8+
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Basavaraj8143/agrisense.git
cd agrisense
```

**2. Set up a virtual environment**

```bash
python -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows
.\venv\Scripts\activate
```

**3. Install dependencies**

```bash
pip install -r backend/requirements.txt
```

**4. Configure environment variables**

Create a `.env` file in the root directory:

```ini
DEEPGRAM_API_KEY=your_deepgram_key_here
OPENROUTER_API_KEY=your_openrouter_key_here
FLASK_DEBUG=True
```

**5. Run the application**

```bash
python backend/app.py
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Deployment

The project is configured for deployment on **Render**.

1. Push code to GitHub.
2. Create a new Web Service on Render linked to your repository.
3. Set the following:
   - **Build command:** `pip install -r backend/requirements.txt`
   - **Start command:** `gunicorn --chdir backend app:app`
4. Add `DEEPGRAM_API_KEY` and `OPENROUTER_API_KEY` under environment variables in the Render dashboard.

---

## Contributing

Contributions are welcome.

1. Fork the project.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

*Empowering Farmers, One Click at a Time. 🌾*