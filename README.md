# 🚀 Skill-Sync AI: Smart Allocation Engine for PM Internship Scheme

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128.0-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Beanie_ODM-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)

**Skill-Sync AI** is an intelligent, automated allocation platform engineered for the **PM Internship Scheme**. It leverages modern Generative AI (Google Gemini API) and Machine Learning matching algorithms to dynamically match student candidates with corporate internship opportunities based on skills, academic qualifications, preferences, and diversity targets.

---

## 🌟 Key Features

- **🤖 AI-Powered Candidate Matching:** Multi-dimensional scoring engine that evaluates candidate skills, domain knowledge, experience, and aspirations against internship job descriptions using Google Gemini AI.
- **🎓 Student Portal:** Interactive dashboard for students to build profiles, upload resumes, receive personalized AI recommendations, track applications, and access upskilling paths.
- **🏢 Corporate Dashboard:** Enterprise interface for companies to create internship postings, review candidate match percentages, and manage candidate pipelines.
- **🛠️ Admin Allocation & Diversity Analytics:** Comprehensive administrative panel offering automated macro-allocation routines, regional/gender diversity monitoring, and system metrics.
- **🎙️ AI Mock Interviewer & Upskilling:** Interactive AI mentor and mock interviewer helping candidates prepare for tech and product management roles with instant feedback reports.
- **🔐 Role-Based Authentication:** Secure JWT authentication with defined access controls for Students, Corporate Recruiters, and Scheme Administrators.

---

## 🏗️ Technology Architecture

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router DOM |
| **Backend REST API** | Python 3.9+, FastAPI, AsyncIO, Uvicorn |
| **Database & ODM** | MongoDB, Motor (Async Driver), Beanie ODM |
| **AI & Machine Learning** | Google Gemini API (`@google/generative-ai`), Scikit-learn, Passlib |
| **Build & Tooling** | Vite, npm, Python Virtual Environments (`venv`) |

---

## ⚡ Quick Start Guide

### Prerequisites

Ensure you have the following software installed:
- **Node.js** (v18.0 or higher) & `npm`
- **Python** (v3.9 or higher)
- **MongoDB** (Running locally at `mongodb://localhost:27017` or a cloud MongoDB Atlas URI)

---

### 1️⃣ Frontend Setup

```bash
# 1. Navigate to the project root directory
cd Smart-Allocation-Engine-for-PM-Internship-Scheme

# 2. Install dependencies
npm install

# 3. Start Vite development server
npm run dev
```

➜ Frontend Application: **`http://localhost:5173`**

To build for production:
```bash
npm run build
```

---

### 2️⃣ Backend REST API Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Virtual Environment
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\Activate.ps1

# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# 3. Install required Python packages
pip install -r requirements.txt

# 4. Set up Environment Variables (.env)
# Create a .env file inside backend directory with:
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=pm_internship_db
GEMINI_API_KEY=your_google_gemini_api_key
SECRET_KEY=your_super_secret_jwt_key

# 5. Start the FastAPI server with auto-reload
uvicorn app.main:app --reload
```

➜ Backend Server: **`http://127.0.0.1:8000`**

---

## 📚 API Endpoints & Interactive Documentation

Once the backend FastAPI server is running, explore interactive API documentation at:

- **Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Core Router Modules

| Route Prefix | Description |
| :--- | :--- |
| `/api/auth` | User registration, authentication, JWT login & token management |
| `/api/students` | Student profile creation, resume processing & preferences |
| `/api/internships` | Corporate internship creation, listing, updating & filtering |
| `/api/matching` | AI candidate-to-internship allocation engine & score calculation |
| `/api/ai` | AI Mentor chat, mock interview assessment & resume suggestions |
| `/api/admin` | System overview, macro allocation execution & diversity stats |

---

## 📂 Folder Structure

```
Smart-Allocation-Engine-for-PM-Internship-Scheme/
├── components/          # React UI components (Dashboards, Cards, Forms, AI Tools)
├── services/            # Frontend API client services & AI connectors
├── public/              # Static public assets
├── backend/
│   ├── app/
│   │   ├── api/         # FastAPI endpoints (auth, students, internships, matching, ai, admin)
│   │   ├── core/        # App configuration & security settings
│   │   └── models/      # Beanie ODM database schemas & Pydantic models
│   ├── seed_db.py       # Sample data populator script
│   └── requirements.txt # Python dependency specification
├── App.tsx              # Main application root component
├── index.html           # HTML entry point
├── package.json         # Frontend package configuration
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite bundler configuration
```

---

## 🔗 Repository Information

- **GitHub Repository:** [https://github.com/DHARSHAN-PARAMASIVAN/Smart-Allocation-Engine-for-PM-Internship-Scheme.git](https://github.com/DHARSHAN-PARAMASIVAN/Smart-Allocation-Engine-for-PM-Internship-Scheme.git)
- **Author & Maintainer:** [DHARSHAN-PARAMASIVAN](https://github.com/DHARSHAN-PARAMASIVAN)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
