# 🤖 AI Career Pro: Unified Interview & Mentor System

An intelligent, multi-service platform designed to revolutionize the career journey through **Groq Cloud AI**. This system integrates high-performance AI-driven interview preparation, ATS-optimized resume analysis, and a global interactive career mentor with real-time job searching capabilities.

---

## 🌟 Key Features

### 1. **Pro-Interactive Multilingual Voice Mentor**
- **Global Floating Workspace**: Accessible from any page with a professional **600px x 750px** interactive interface.
- **Multi-Language Support**: Full communication support for 9+ languages (English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, and Gujarati).
- **Voice-to-Voice Interaction**: 
    - **Smart STT**: High-accuracy Speech-to-Text with real-time visual audio bars.
    - **Auto-Submit**: Voice recognition automatically triggers AI responses once you finish speaking.
    - **High-Quality TTS**: Automated Text-to-Speech responses tailored to the selected language's locale.
- **Multi-Turn Memory**: Built-in conversation logs allow the mentor to remember your history and guide you step-by-step.
- **High-Clarity Mentoring**: Strictly formatted **points-wise** responses with emojis and double-spacing for maximum readability.

### 2. **Groq-Powered Resume Hub**
- **Deep Analysis**: Near-instant resume diagnosis powered by **Llama 3.3-70b** via Groq Cloud.
- **ATS Optimizer**: Realistic compatibility scoring, skill gap detection, and keyword suggestions.
- **Pro Resume Builder**: 8-step wizard with real-time AI-enhanced project descriptions and professional summaries.
- **PDF Generation**: High-fidelity, ATS-friendly PDF exports using `pdf-lib`.

### 3. **AI Interview Simulation**
- **Dynamic Questioner**: Real-time interview simulator with role-specific technical question generation.
- **Live Assessment**: Immediate feedback on responses with automated scoring and detailed feedback.

### 4. **AI Coding Interview Engine**
- **Dynamic AI Generation**: Uses **Groq AI** to generate unique coding challenges based on the selected role.
- **Difficulty Selection**: Support for **Easy, Medium, and Hard** difficulty levels to match candidate seniority.
- **Universal Code Execution**: Real-time execution support for **Python, JavaScript, Java, C++, and Bash** with security timeouts.
- **Automated AI Grading**: Detailed performance reports analyzing code quality, logic, and efficiency.

### 5. **Live Job Recommendations (New)**
- **SerpApi Integration**: Real-time job listings fetched directly from Google Jobs.
- **Smart Matching**: AI-driven analysis to match your skills with live job requirements.
- **Direct Apply**: One-click access to application portals for matching roles.

### 6. **Comprehensive User Profile & Career Personalization**
- **Branch-Specific Analysis**: Accurately maps engineering branch specializations (e.g., CSE, ECE, ME) to provide tailored career advice and job recommendations.
- **Dynamic Profile Management**: Integrated user profile tracking that informs the AI mentor about your background and goals.

---

## 🛠️ Unified Tech Stack

### **Frontend (The Interface)**
- **React 19**: Modern component-based architecture.
- **Tailwind CSS**: Utility-first styling for high-performance glassmorphism designs.
- **Framer Motion**: Smooth, premium animations and page transitions.
- **Lucide Icons**: Consistent, modern iconography.

### **Python Backend (AI & Interview Logic)**
- **Flask**: Micro-framework handling career mentoring and interview assessment.
- **Groq Cloud SDK**: Powering all conversational AI and deep analysis.
- **SerpApi**: Dynamic job search integration for live market data.
- **Execution Service**: Custom isolated subprocess-based runner for multi-language code assessment.
- **Spacy**: Natural Language Processing for resume text parsing.
- **MongoDB**: For storing career tracking data, coding submissions, and progress.

### **Node.js Backend (Resume & PDF Logic)**
- **Express**: High-performance API for resume building and analytics.
- **Groq Node SDK**: Real-time AI enhancements for resumes.
- **pdf-lib**: Client-side and server-side PDF manipulation.
- **Firebase Admin**: Secure authentication verification and storage management.

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v18+)
- **Python** (3.9+)
- **MongoDB** (Local or Atlas)
- **Groq API Key** (Get it at [Groq Console](https://console.groq.com/))
- **SerpApi Key** (Get it at [SerpApi](https://serpapi.com/))

### **Installation & Setup**

#### 1. Clone the Repository
```bash
git clone https://github.com/Sachin1817/Ai-Interview-System.git
cd Ai-Interview-System
```

#### 2. Python Backend (Port 5000)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```
Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_key_here
SERP_API_KEY=your_serp_api_key_here
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_placement_db
```

#### 3. Node.js Backend (Port 5001)
```bash
cd ../node-backend
npm install
```
Create `node-backend/.env`:
```env
GROQ_API_KEY=your_groq_key_here
PORT=5001
```

#### 4. Frontend (Port 3000)
```bash
cd ../frontend
npm install
npm start
```

---

## 🏃 Running the Full-Stack Application

To run the complete system, start the following in separate terminals:

1. **Python AI Server**: `cd backend && venv\Scripts\activate && python app.py`
2. **Node Resume Server**: `cd node-backend && npm run dev`
3. **React Client**: `cd frontend && npm start`

---

## 📂 Architecture Overview
```text
├── frontend/             # High-End React Interface
│   └── src/components/   # Modular Career Mentor, Resume Hub, Interviews & Coding
├── backend/              # Python AI, Mentoring & Job Search Services
│   ├── services/         # Groq AI Orchestration, Execution Engine, SerpApi Integration
│   └── routes/           # Interactive Career, Coding & Assessment Endpoints
└── node-backend/         # Node.js Resume & Document Processing
    └── routes/          # AI Resume Analysis & PDF Generation
```

---
*Developed by [Sachin D](https://github.com/Sachin1817)* | **Powered by Groq Cloud AI**