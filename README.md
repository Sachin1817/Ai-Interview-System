# 🤖 AI Interview System

An intelligent, full-stack platform designed to revolutionize the recruitment process through AI-driven interview preparation, resume analysis, and career guidance. This system leverages advanced NLP (Natural Language Processing) and Generative AI to provide personalized feedback and assessment for candidates.

## 🌟 Features

### 1. **AI-Powered Interview Module**
- Real-time interview simulation with personalized questions.
- Dynamic assessment based on candidate responses.
- Powered by **Google Gemini AI** and **Transformers**.

### 2. **Intelligent Resume Analyzer**
- PDF resume parsing using **PyPDF**.
- Entity extraction and skill mapping using **SpaCy**.
- Provides a detailed compatibility score for job roles.

### 3. **Career Guidance & Path Mapping**
- Analyzes candidate background to suggest optimal career trajectories.
- Skill gap analysis to help candidates prepare for their target roles.

### 4. **Interactive Dashboard**
- Real-time progress tracking with **Chart.js**.
- Beautifully animated UI using **Framer Motion**.
- Secure authentication via **Firebase** and **JWT**.

---

## 🛠️ Tech Stack

### **Frontend**
- **Library**: [React 19](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Chart.js](https://www.chartjs.org/)
- **State/Auth**: Firebase & Context API
- **Forms**: React Hook Form & Yup

### **Backend**
- **Framework**: [Flask](https://flask.palletsprojects.com/)
- **AI/ML**: Google Gemini API, SpaCy, HuggingFace Transformers
- **Database**: [MongoDB](https://www.mongodb.com/)
- **Security**: JWT (PyJWT), Flask-CORS
- **Parsing**: PyPDF

---

## 🚀 Getting Started

### **Prerequisites**
- **Node.js** (v18+)
- **Python** (3.9+)
- **MongoDB** (Local or Atlas)
- **Gemini API Key**

### **Installation**

#### 1. Clone the repository
```bash
git clone https://github.com/Sachin1817/Ai-Interview-System.git
cd Ai-Interview-System
```

#### 2. Backend Setup
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

Create a `.env` file in the `backend/` folder:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
# Add your MongoDB connection if required
# MONGO_URI=mongodb://localhost:27017/interview_system
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

---

## 🏃 Running the Application

### **Start Backend**
```bash
cd backend
# With venv activated
python app.py
```
The backend will run on `http://localhost:5000`.

### **Start Frontend**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`.

---

## 📂 Project Structure

```text
├── backend/
│   ├── routes/          # API Endpoints
│   ├── services/        # AI & Business Logic
│   ├── models/          # Database Schemas
│   ├── utils/           # Helper Functions
│   └── app.py           # Flask Entry Point
├── frontend/
│   ├── src/
│   │   ├── components/  # UI Components
│   │   ├── contexts/    # Global State
│   │   ├── pages/       # Route Pages
│   │   └── services/    # API Integration
│   └── public/
├── uploads/             # Resume storage
└── .gitignore           # Version control exceptions
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the ISC License - see the `package.json` for details.

---
*Developed by [Sachin](https://github.com/Sachin1817)*