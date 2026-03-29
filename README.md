# 🤖 AI Interview & Placement System

An intelligent, full-stack platform designed to revolutionize the recruitment process through AI-driven interview preparation, ATS-optimized resume analysis, and automated resume building. This system leverages advanced NLP (Natural Language Processing) and Generative AI to provide personalized feedback and career guidance for candidates.

## 🌟 Key Features

### 1. **AI-Powered Resume Analyzer**
- PDF resume parsing and entity extraction.
- **Gemini 1.5 Flash** powered deep diagnosis.
- Compatibility scoring, skill gap detection, and personalized roadmap.

### 2. **ATS Resume Builder (New Module)**
- 8-step professional wizard with real-time AI optimization.
- Generates ATS-friendly PDF resumes using `pdf-lib`.
- Integration with Node.js backend for high-performance processing.

### 3. **AI Interview Simulation**
- Real-time interview simulator with personalized question generation.
- Dynamic assessment and responses powered by **HuggingFace Transformers**.

### 4. **Smart Career Advisor**
- Analyzes candidate background to suggest optimal career trajectories.
- Job role predictions and readiness tracking.

### 5. **Interactive Dashboard & Profile**
- Beautifully animated UI using **Framer Motion**.
- Real-time progress tracking with **Chart.js**.
- Secure authentication and profile management via **Firebase**.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Axios |
| **Python Backend** | Flask, Google Gemini API, Spacy, MongoDB, Flask-APScheduler |
| **Node Backend** | Node.js, Express, pdf-lib, Firebase Admin |
| **Database** | MongoDB (Local/Atlas) |
| **Authentication** | Firebase Auth & JWT |

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v18+)
- **Python** (3.9+)
- **MongoDB** (Local or Atlas)
- **Gemini API Key** (Google AI Studio)

### **Installation**

#### 1. Clone the repository
```bash
git clone https://github.com/Sachin1817/Ai-Interview-System.git
cd Ai-Interview-System
```

#### 2. Python Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_sm
```
Create `backend/.env`:
```env
GEMINI_API_KEY=your_key_here
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai_placement_db
```

#### 3. Node Backend Setup
```bash
cd ../node-backend
npm install
```
Create `node-backend/.env`:
```env
PORT=5001
# Add Firebase config if required
```

#### 4. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

To run the full system, you need to start three separate services. It is recommended to run them in separate terminals or use a task runner like `concurrently`.

### **1. Start Python Backend (Interview & AI Analysis)**
```bash
cd backend
# With venv activated
python app.py
```
*Runs on `http://localhost:5000`*

### **2. Start Node Backend (Resume Builder)**
```bash
cd node-backend
npm run dev
```
*Runs on `http://localhost:5001`*

### **3. Start Frontend (Dashboard)**
```bash
cd frontend
npm start
```
*Runs on `http://localhost:3000`*

---

## 📂 Project Structure

```text
├── backend/             # Python Flask API
│   ├── routes/          # AI & Auth Endpoints
│   ├── services/        # Gemini & NLP Logic
│   └── app.py           # Entry Point (Port 5000)
├── node-backend/        # Node.js ATS Resume API
│   ├── routes/          # Resume Generation Logic
│   └── server.js        # Entry Point (Port 5001)
├── frontend/            # React Client
│   ├── src/components/  # UI Modules (Resume, Auth, Profile)
│   └── src/pages/       # Route Views
└── uploads/             # Global storage directory
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License.

---
*Developed by [Sachin D](https://github.com/Sachin1817)*