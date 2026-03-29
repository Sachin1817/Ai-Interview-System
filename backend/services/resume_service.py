import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def extract_text_from_pdf(pdf_path):
    from pypdf import PdfReader
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def analyze_resume(text):
    """
    Use Gemini AI to perform a deep analysis of the resume text.
    Returns a structured diagnosis for the user.
    """
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a Senior Technical Recruiter and ATS Expert.
        Analyze the following Resume Text and provide a detailed diagnosis.
        
        RESUME TEXT:
        {text}
        
        Your output MUST be a valid JSON object with these exact keys:
        - "skills": (List of detected technical and soft skills)
        - "score": (Integer 0-100, Job Readiness/ATS Score)
        - "missing_skills": (List of 3-5 critical skills missing for standard roles in their field)
        - "job_roles": (List of 2-3 specific job roles they are qualified for)
        - "roadmap": (List of 3 actionable steps to improve their profile)
        
        Return ONLY the JSON object.
        """
        
        response = model.generate_content(prompt)
        raw_text = response.text.strip()
        
        # Clean potential markdown formatting
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        diagnosis = json.loads(raw_text)
        return diagnosis
        
    except Exception as e:
        print(f"Gemini Analysis Error: {e}")
        # Robust Fallback in case of AI failure
        return {
            "skills": ["Python", "General Tech"],
            "score": 50,
            "missing_skills": ["Cloud Computing", "System Design"],
            "job_roles": ["Software Developer"],
            "roadmap": ["Build complex projects", "Learn cloud platforms", "Practice DSA"]
        }
