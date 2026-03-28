from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
import json
import uuid

assessment_bp = Blueprint('assessment', __name__)

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

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
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        
        try:
            # Strip potential markdown formatting if model disobeys
            raw_text = response.text.strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
                
            questions = json.loads(raw_text.strip())
            
            # Append unique IDs
            for i, q in enumerate(questions):
                q['id'] = f"ai_{uuid.uuid4().hex[:8]}"
                
            if len(questions) != 10:
                print(f"Warning: Gemini returned {len(questions)} questions instead of 10.")
                
            return jsonify({"status": "success", "questions": questions}), 200
            
        except json.JSONDecodeError as je:
            print("JSON Decode Error:", je)
            print("Raw text:", response.text)
            return jsonify({"status": "error", "message": "AI returned malformed JSON"}), 500
            
    except Exception as e:
        print("Assessment Generation Error:", str(e))
        return jsonify({"status": "error", "message": str(e)}), 500
