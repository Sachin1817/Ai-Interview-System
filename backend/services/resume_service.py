from pypdf import PdfReader
import spacy
import os

# Load spaCy model (will be available once dependencies finish)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    nlp = None

def extract_text_from_pdf(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def analyze_resume(text):
    # Basic skill extraction logic (to be expanded with NLP)
    skills_list = [
        "python", "java", "javascript", "react", "html", "css", "sql", "mongodb",
        "flask", "django", "node", "express", "aws", "docker", "kubernetes",
        "machine learning", "data science", "nlp", "c++", "c#", "ruby", "php"
    ]
    
    extracted_skills = []
    text_lower = text.lower()
    for skill in skills_list:
        if skill in text_lower:
            extracted_skills.append(skill)
            
    # Mock data for diagnosis (to be replaced with real NLP analysis)
    diagnosis = {
        "skills": extracted_skills,
        "score": len(extracted_skills) * 10 if len(extracted_skills) <= 10 else 95,
        "missing_skills": ["docker", "kubernetes", "aws"] if "aws" not in extracted_skills else [],
        "job_roles": ["Full Stack Developer", "Backend Engineer"] if "python" in extracted_skills else ["Frontend Developer"],
        "roadmap": [
            "Learn Cloud Computing (AWS/Azure)",
            "Master Containerization with Docker",
            "Deep dive into Data Structures & Algorithms"
        ]
    }
    
    return diagnosis
