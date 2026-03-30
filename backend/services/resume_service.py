from .ai_service import generate_ai_response
import json
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
# genai configuration removed, handled by gemini_service

def extract_text_from_pdf(pdf_path):
    from pypdf import PdfReader
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            content = page.extract_text()
            if content:
                text += content + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF Extraction Error: {e}")
        return ""

def _clean_json_response(raw_text):
    """Utility to extract JSON from model response that may contain markdown or extra text."""
    try:
        # 1. Clean up whitespace and find the JSON structure
        raw_text = raw_text.strip()
        
        # 2. Try to find JSON array or object
        start_arr = raw_text.find('[')
        start_obj = raw_text.find('{')
        
        # Determine which one appears first (if both exist) or only one
        if start_arr != -1 and (start_obj == -1 or start_arr < start_obj):
            start = start_arr
            end = raw_text.rfind(']')
        elif start_obj != -1:
            start = start_obj
            end = raw_text.rfind('}')
        else:
            return json.loads(raw_text) # Fallback to original
            
        if start != -1 and end != -1:
            json_str = raw_text[start:end+1]
            return json.loads(json_str)
            
        return json.loads(raw_text)
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return None


def analyze_resume(text):
    """
    Use Groq AI (Llama 3) to perform a deep analysis of the resume text.
    Returns a structured diagnosis for the user.
    """
    if not text or len(text.strip()) < 50:
        return {
            "skills": ["No text detected"],
            "score": 0,
            "missing_skills": ["Unable to analyze empty or short resume"],
            "job_roles": ["N/A"],
            "roadmap": ["Ensure your PDF has selectable text", "Upload a valid resume"]
        }

    try:
        prompt = f"""
        You are a Senior Technical Recruiter and ATS Expert.
        Analyze the following resume text and provide a deep, professional diagnosis.
        
        RESUME TEXT:
        {text}
        
        Provide your analysis strictly in JSON format with these exact keys:
        - skills: (List of strings) Extract all technical skills, frameworks, and tools.
        - soft_skills: (List of strings) Extract any soft skills like Leadership, Communication, etc.
        - score: (Integer 0-100) A realistic ATS compatibility score based on content depth and formatting.
        - missing_skills: (List of strings) Identify 5 critical skills/tools missing for a modern role in the user's field.
        - job_roles: (List of strings) Top 3-5 job titles the user is currently qualified for.
        - roadmap: (List of strings) A 5-step actionable plan to improve the profile for senior-level roles.
        
        Your response must be ONLY the JSON object. No conversational text.
        """
        raw_text = generate_ai_response(prompt)
        if not raw_text:
             raise ValueError("AI failed to return a valid response")
             
        print(f"RAW AI RESPONSE:\n{raw_text}\n{'='*40}")
        
        diagnosis = _clean_json_response(raw_text)
        
        if diagnosis:
            return diagnosis
            
        raise ValueError(f"Failed to parse AI response as JSON. Raw text: {raw_text}")
        
    except Exception as e:
        import traceback
        print(f"Gemini Analysis Error: {e}")
        traceback.print_exc()
        # Robust Fallback in case of AI failure
        return {
            "skills": ["Python", "General Tech"],
            "score": 50,
            "missing_skills": ["Cloud Computing", "System Design"],
            "job_roles": ["Software Developer"],
            "roadmap": ["Build complex projects", "Learn cloud platforms", "Practice DSA"]
        }



