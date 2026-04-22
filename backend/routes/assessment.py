from flask import Blueprint, request, jsonify
from services.ai_service import generate_ai_response
import os
import json
import uuid

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

assessment_bp = Blueprint('assessment', __name__)

# genai configuration removed, handled by gemini_service

@assessment_bp.route('/generate', methods=['POST'])
def generate_assessment():
    try:
        data = request.json
        cat = data.get('category', 'Technical')
        branch = data.get('branch', 'CSE')
        topic = data.get('topic', 'General')
        diff = data.get('difficulty', 'Beginner')
        
        prompt = f"""
        You are an expert examiner for placement and professional certification exams.
        Generate exactly 10 high-quality, accurate, non-repeating multiple-choice questions for the following specification:
        Category: {cat}
        Branch/Context: {branch}
        Topic: {topic}
        Difficulty: {diff}
        
        Guidelines:
        1. For Technical topics: Provide rigorous, industry-standard engineering questions.
        2. For Aptitude (Quantitative/Logical): Provide challenging, unique word problems or logic puzzles.
        3. For Communication (Grammar/Verbal): Provide realistic verbal reasoning or advanced grammar questions.
        
        The output must be pure, valid JSON (without any markdown formatting like ```json) in the following structure:
        [
            {{
                "q": "The question text?",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "answer": "The exact string of the correct option",
                "topic": "{topic} (or a more specific sub-topic)"
            }}
        ]
        Make sure there are exactly 4 options per question, and the answer exactly matches one of the options.
        Do not output any introductory or concluding text, ONLY the JSON array.
        """
        
        raw_text_raw = generate_ai_response(prompt)
        if not raw_text_raw:
             raise ValueError("Gemini failed to generate assessment")
        
        try:
            questions = _clean_json_response(raw_text_raw)
            if not questions:
                raise ValueError("Could not extract valid JSON from AI response")
            
            # Extract questions if wrapped in a dict
            if isinstance(questions, dict) and "questions" in questions:
                questions = questions["questions"]
            elif isinstance(questions, dict):
                # if it is a dict but no questions key, maybe it's the single object
                questions = [questions]
                
            if not isinstance(questions, list):
                raise ValueError("AI response did not contain a list of questions")

            # Append unique IDs
            for i, q in enumerate(questions):
                q['id'] = f"ai_{uuid.uuid4().hex[:8]}"
                
            # Validate counts
            if len(questions) < 10:
                print(f"Warning: Groq returned {len(questions)} questions instead of 10.")
                
            return jsonify({"status": "success", "questions": questions}), 200
            
        except json.JSONDecodeError as je:
            print("JSON Decode Error:", je)
            print("Raw text:", raw_text_raw)
            return jsonify({"status": "error", "message": "AI returned malformed JSON"}), 500
            
    except Exception as e:
        print("Assessment Generation Error:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500
