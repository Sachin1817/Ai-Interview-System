# <p align="center">⚡ TalentMatrix AI: Autonomous Campus Recruitment & Interview Intelligence Ecosystem</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Python-Flask%203.x-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Flask" />
  <img src="https://img.shields.io/badge/Node.js-Express%204.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/LiveKit-WebRTC%20Engine-FF6B6B?style=for-the-badge&logo=webrtc&logoColor=white" alt="LiveKit WebRTC" />
  <img src="https://img.shields.io/badge/Groq%20Cloud-Llama%203.3--70B-F55036?style=for-the-badge&logo=fastapi&logoColor=white" alt="Groq Llama 3.3" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT" />
</p>

<p align="center">
  <strong>An enterprise-grade, end-to-end AI recruitment and placement training platform.</strong>
  <br />
  Featuring real-time WebRTC conversational voice interviews, multi-persona AI Group Discussion (GD) simulations, ATS resume optimization, sandboxed multi-language code execution, composite campus leaderboards, and an administrative HR Command Center with bulk workflows.
</p>

---

## 🧭 Table of Contents

- [🌟 Core Platform Capabilities](#-core-platform-capabilities)
  - [1. 🎙️ Real-Time AI Voice Interviewer (WebRTC + LiveKit)](#1-🎙️-real-time-ai-voice-interviewer-webrtc--livekit)
  - [2. 👥 Virtual AI Group Discussion (GD) Simulator](#2-👥-virtual-ai-group-discussion-gd-simulator)
  - [3. 🤖 Behavioral & STAR Mode Mock Interview](#3-🤖-behavioral--star-mode-mock-interview)
  - [4. 💻 Interactive AI Coding Sandbox](#4-💻-interactive-ai-coding-sandbox)
  - [5. 🚀 8-Step ATS Resume Builder & Deep Skill Gap Analyzer](#5-🚀-8-step-ats-resume-builder--deep-skill-gap-analyzer)
  - [6. 💼 Campus Placement & Intelligent Job Matching](#6-💼-campus-placement--intelligent-job-matching)
  - [7. 📊 Performance Analytics & Campus Leaderboards](#7-📊-performance-analytics--campus-leaderboards)
  - [8. 🏢 HR Admin Command Center & Bulk Automation](#8-🏢-hr-admin-command-center--bulk-automation)
  - [9. 🔔 In-App Broadcast Center & SMTP Mailer](#9-🔔-in-app-broadcast-center--smtp-mailer)
- [🏗️ Architectural Architecture](#%EF%B8%8F-architectural-architecture)
- [🛠️ Unified Technology Stack](#%EF%B8%8F-unified-technology-stack)
- [📂 Directory Blueprint](#-directory-blueprint)
- [🚀 Quickstart & Setup Guide](#-quickstart--setup-guide)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Python Flask Backend Setup](#2-python-flask-backend-setup)
  - [3. Node.js ATS Resume Backend Setup](#3-nodejs-ats-resume-backend-setup)
  - [4. React Frontend Client Setup](#4-react-frontend-client-setup)
  - [5. Environment Variables (.env) Reference](#5-environment-variables-env-reference)
- [🏃 Running the System](#-running-the-system)
- [🛡️ Security, Isolation & Performance](#%EF%B8%8F-security-isolation--performance)
- [✍️ Author & License](#%EF%B8%8F-author--license)

---

## 🌟 Core Platform Capabilities

### 1. 🎙️ Real-Time AI Voice Interviewer (WebRTC + LiveKit)
* **Real-Time Audio/Video Telemetry**: Built on **LiveKit WebRTC**, supporting low-latency bidirectional voice streams, camera feeds, and real-time audio visualization.
* **Intelligent Conversational Agent**: Powered by **Groq Cloud (Llama 3.3-70B)** to dynamically generate role-specific questions, listen to verbal responses, and articulate natural voice follow-ups.
* **Automated Speech Transcription & Turn-Taking**: Live speech-to-text with auto-silence detection and continuous transcription buffers.
* **Instant Multi-Metric Critique**: Immediately delivers actionable subscores across Technical Accuracy, Communication Clarity, Problem Solving, and Culture Fit with timestamped turn transcripts.

### 2. 👥 Virtual AI Group Discussion (GD) Simulator
* **Multi-Persona AI Roundtable**: Simulates a 5-participant corporate GD panel consisting of:
  * 🧑‍⚖️ **Dr. Rajesh Sharma (AI Moderator)** — Sets topics, monitors speaking time, and guides conclusions.
  * 👨‍💻 **Aarav Patel (Technical & Analytical)** — Emphasizes hard data, technical viability, and system trade-offs.
  * 👩‍💼 **Priya Nair (Business & Strategy)** — Focuses on ROI, market dynamics, and operational feasibility.
  * 💡 **Rohan Gupta (Innovative & Critical)** — Challenges assumptions, presents counter-arguments, and proposes novel frameworks.
  * 🤝 **Sneha Kulkarni (Ethics & People-Centric)** — Highlights user privacy, societal impact, and ethical implications.
* **Sequential Opening Stances**: All AI participants articulate distinct opening viewpoints before transitioning into live open-floor discussion.
* **4-Pillar Comprehensive Scorecard**:
  1. *Leadership & Initiative* (Initiating discussions, guiding peer direction).
  2. *Domain Knowledge & Reasoning* (Fact retention, sound logic, depth).
  3. *Communication & Articulation* (Fluency, voice tone, conciseness).
  4. *Group Dynamics & Listening* (Respectful turn taking, building upon peer points).

### 3. 🤖 Behavioral & STAR Mode Mock Interview
* **Domain-Specific Scenarios**: Real-time behavioral and technical question generation adapting precisely to **8 engineering specializations** (CSE, IT, ECE, EEE, ME, Civil, Chemical, BioTech).
* **STAR Framework Evaluation**: Explicit prompts and scoring for Situation, Task, Action, and Result structures.
* **Immediate Grade Analytics**: Visual radar charts, strength highlights, improvement points, and ideal sample answers.

### 4. 💻 Interactive AI Coding Sandbox
* **Real-Time Multi-Language Sandbox**: Monaco-style editor supporting **Python, JavaScript, Java, and C++** with isolated runtime execution and execution timeouts.
* **Algorithmic Role-Based Challenges**: AI-generated problems mapped to developer profiles (Frontend, Backend, Fullstack, DevOps, Data Science) across Easy, Medium, and Hard tiers.
* **Post-Submit Architectural Review**: Automated reports evaluating time/space complexity, modularity, edge cases, and best practices.

### 5. 🚀 8-Step ATS Resume Builder & Deep Skill Gap Analyzer
* **8-Step Guided Wizard**: Step-by-step resume builder with real-time AI optimization for summaries, work experience, and technical bullet points.
* **High-Fidelity PDF Engine**: Compiles single-page, ATS-compliant resumes client-side using `pdf-lib`.
* **Deep Diagnostic Scanner**: Extracts text from PDF resumes, cross-references with modern job benchmarks, computes ATS score breakdowns (Formatting, Keywords, Action Verbs), and identifies missing critical skills.

### 6. 💼 Campus Placement & Intelligent Job Matching
* **Curated Placement Openings**: Browse active campus placement jobs with detailed eligibility criteria and salary bands.
* **AI Match Score**: Analyzes student profile and resume ATS data against job descriptions to provide a direct compatibility percentage.
* **Live Application Tracking**: Full status workflow (Applied ➔ Shortlisted ➔ Interview Scheduled ➔ Selected / Rejected).

### 7. 📊 Performance Analytics & Campus Leaderboards
* **Candidate Analytics Dashboard**: Visualizes score trajectories over time with interactive Chart.js graphs, domain radar charts, and detailed question-by-question modal drill-downs.
* **Campus Composite Leaderboard**: Aggregates interview performance, resume ATS scores, assessment tests, and coding challenges into a unified rank index with tiered badge honors.

### 8. 🏢 HR Admin Command Center & Bulk Automation
* **Candidate & Application Directory**: Filter and search through candidates with real-time pagination and ATS filters.
* **Floating Multi-Select Action Bar**: Perform one-click batch operations on multiple selected candidates:
  * ⚡ **Bulk Status Updates** (Shortlist, Schedule Interview, Select/Hire, Reject).
  * 📌 **Bulk Track Assignment** (Assign custom interview tracks and coding assessments).
  * ✉️ **Bulk Email Broadcasts** (Send templated/custom broadcast messages with variable substitution like `{name}`).
  * 📥 **CSV Data Exports** (Export candidate directories and application pipelines with one click).
* **Interactive AI Voice Session Review**: HR modal allowing administrators to inspect full LiveKit voice transcripts, turn durations, audio analytics, and AI score breakdowns.

### 9. 🔔 In-App Broadcast Center & SMTP Mailer
* **Real-Time Notification Bell**: Unread counters with instant polling, sound cues, and local-timezone relative timestamps (`Just now`, `3m ago`).
* **Teleported Notification Detail Modal**: Fullscreen React Portal preview displaying complete announcement text, category tags, and timestamps.
* **Dual Dispatch Engine**: Sends in-app alerts and dispatches formatted SMTP emails (with file-based logging fallback).

---

## 🏗️ Architectural Architecture

```
                                  +-----------------------+
                                  |   React 18 Frontend   |
                                  |  (Tailwind + Framer)  |
                                  +-----------+-----------+
                                              |
                   +--------------------------+--------------------------+
                   | (REST / JSON)                                       | (REST / JSON)
                   v                                                     v
      +------------------------+                            +------------------------+
      |  Flask 3.x API Engine  |                            | Express ATS PDF Engine |
      |      (Port 5000)       |                            |      (Port 5001)       |
      +-----------+------------+                            +------------------------+
                  |
        +---------+---------+-------------------+
        |                   |                   |
        v                   v                   v
+---------------+   +---------------+   +---------------+
| MongoDB Atlas |   | Groq Cloud AI |   | LiveKit Cloud |
| (Data Store)  |   | (Llama 3.3)   |   |   (WebRTC)    |
+---------------+   +---------------+   +---------------+
```

---

## 🛠️ Unified Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI/UX** | React 18, TailwindCSS, Framer Motion, Lucide Icons, Chart.js, React-Chartjs-2, React Portal |
| **Real-Time Media** | LiveKit WebRTC SDK, Web Speech API (STT & TTS), HTML5 Canvas Visualizers |
| **Primary Backend** | Python 3.11+, Flask, PyMongo, Flask-CORS, PyJWT, Werkzeug, Smtplib |
| **Document Backend**| Node.js 18+, Express, PDF-Lib, Multer, Cors |
| **Artificial Intelligence** | Groq Cloud SDK (`llama-3.3-70b-versatile`, `mixtral-8x7b-32768`) |
| **Database** | MongoDB 6.x / MongoDB Atlas (Collections: users, interviews, jobs, applications, notifications, sessions) |

---

## 📂 Directory Blueprint

```
Ai-Interview-System/
├── backend/
│   ├── app.py                      # Flask Application Entry Point & Blueprint Registry
│   ├── routes/
│   │   ├── admin.py                # HR Admin APIs, Bulk Actions, CSV Exports & Broadcasts
│   │   ├── ai_interview.py         # LiveKit WebRTC Voice Interview Sessions & Token Issuer
│   │   ├── assessment.py           # MCQ Assessment Engine & Timed Quizzes
│   │   ├── auth.py                 # JWT Authentication, Registration & Role Guards
│   │   ├── career.py               # Career Advisor, Skill Roadmaps & Leaderboards
│   │   ├── gd_simulator.py         # Virtual AI Group Discussion Multi-Turn Engine
│   │   ├── interview.py            # STAR Mock Interview Evaluation & Analytics
│   │   └── notifications.py        # Real-time In-App Notifications API
│   ├── services/
│   │   ├── ai_service.py           # Groq LLM Prompt Engineering & Response Parsing
│   │   ├── career_service.py       # Role Matching & Academic Specialization Logic
│   │   └── interview_service.py    # Rubric Grading & Question Generation
│   └── utils/
│       ├── auth_helper.py          # Token Validation & Decorators
│       ├── db.py                   # PyMongo Connection Pool
│       └── email_helper.py         # SMTP Mailer & File Logging Fallback
├── node-backend/
│   ├── server.js                   # Express Server for ATS Resume Building
│   └── routes/resume.js            # Resume Parsing & PDF Compilation Endpoints
├── frontend/
│   ├── src/
│   │   ├── App.js                  # Main React Routing, Navigation & Global Modals
│   │   ├── components/
│   │   │   ├── admin/              # HR Dashboard, Bulk Action Bar, AI Review Modals
│   │   │   ├── ai-interview/       # LiveKit WebRTC Voice Room, Media Setup, Diagnostics
│   │   │   ├── analytics/          # Chart.js Visualizations & Performance Drill-Downs
│   │   │   ├── career/             # Career Advisor & Campus Leaderboards
│   │   │   ├── gd/                 # Virtual GD Simulator & Multi-Avatar Roundtable
│   │   │   ├── interview/          # STAR Mock Interview Interface & Voice Engine
│   │   │   ├── layout/             # 3D Cards, Notification Bell, Theme Toggles
│   │   │   └── resume-builder/     # 8-Step Interactive Resume Builder
│   │   └── services/api.js         # Axios API Client with JWT Interceptors
└── README.md                       # Comprehensive Project Documentation
```

---

## 🚀 Quickstart & Setup Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **MongoDB**: Local Community Server running on `mongodb://localhost:27017` or a MongoDB Atlas URI
- **Groq API Key**: Free tier available at [console.groq.com](https://console.groq.com)

---

### 1. Clone Repository
```bash
git clone https://github.com/Sachin1817/Ai-Interview-System.git
cd Ai-Interview-System
```

---

### 2. Python Flask Backend Setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` in `backend/`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_system
JWT_SECRET=your_super_secret_jwt_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here

# LiveKit WebRTC (Optional for Voice Interview Room)
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret

# SMTP Email Configuration (Optional - falls back to local logging)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM="Placement AI <noreply@placementai.com>"
```

Start the Flask Backend:
```bash
python app.py
# Running on http://localhost:5000
```

---

### 3. Node.js ATS Resume Backend Setup
```bash
cd ../node-backend
npm install
npm start
# Running on http://localhost:5001
```

---

### 4. React Frontend Client Setup
```bash
cd ../frontend
npm install
npm start
# Running on http://localhost:3000
```

---

## 🏃 Running the System

Once all 3 services are launched:
- 🌐 **Candidate Portal**: `http://localhost:3000/`
- 🎙️ **Real-Time Voice Interview**: `http://localhost:3000/ai-interview`
- 👥 **Virtual GD Simulator**: `http://localhost:3000/gd-simulator`
- 📄 **ATS Resume Builder**: `http://localhost:3000/resume-builder`
- 🏢 **HR Admin Command Center**: `http://localhost:3000/admin`
- 🏆 **Campus Leaderboard**: `http://localhost:3000/leaderboard`

---

## 🛡️ Security, Isolation & Performance

1. **Role-Based Access Control (RBAC)**: All HR Admin routes are protected by cryptographic JWT tokens and verified server-side via `check_hr()` guards.
2. **WebRTC Media Isolation**: Microphone and camera streams are handled client-side with explicit user permissions and encrypted WebRTC peer connections.
3. **Timezone UTC Compliance**: All event timestamps and notification dispatches utilize ISO-8601 UTC with standard `Z` designators to prevent local timezone offsets.
4. **Defensive Error Handling**: Network failures and missing third-party credentials (SMTP, LiveKit) gracefully fall back to local sandboxed handlers without service interruption.

---

## ✍️ Author & License

Developed with ❤️ by **Sachin**  
GitHub: [@Sachin1817](https://github.com/Sachin1817)

This project is licensed under the **MIT License** — feel free to fork, customize, and deploy.
