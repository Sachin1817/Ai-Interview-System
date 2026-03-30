import os
from services.ai_service import generate_ai_response
import json

class CodingService:
    # Fallback challenges for each role (used if AI fails)
    STATIC_CHALLENGES = {
        "Frontend Developer": {
            "title": "Responsive Login Form",
            "instructions": "Create an HTML page with a login form (Username, Password, Submit). Use CSS to center it and JS to validate non-empty fields.",
            "language": "html",
            "expected_behavior": "Show alert on empty fields, success message on filled fields."
        },
        "Backend Developer": {
            "title": "REST API Endpoint",
            "instructions": "Write a Node.js Express server with a GET /users endpoint returning {'name': 'John', 'role': 'Developer'}.",
            "language": "javascript",
            "expected_output": "{\"name\": \"John\", \"role\": \"Developer\"}"
        }
    }

    @staticmethod
    def get_challenge_by_role(role, difficulty="Medium"):
        """
        Dynamically generates a coding challenge using Groq AI based on role and difficulty.
        """
        prompt = f"""
        Generate a professional coding interview challenge for the following profile:
        Role: {role}
        Difficulty: {difficulty}
        
        The challenge should be realistic and test core skills relevant to the role at the specified difficulty level.
        
        Difficulty Guidelines:
        - Easy: Basic syntax, loops, and simple logic.
        - Medium: Data structures, standard algorithms, and efficient logic.
        - Hard: Complex algorithms (DP, Graphs), system design patterns, or advanced multi-step logic.
        
        Return the response ONLY as a JSON object with the following keys:
        {{
            "title": "Short descriptive title",
            "instructions": "Detailed, step-by-step instructions for the candidate.",
            "language": "Recommended programming language (e.g., 'python', 'javascript', 'java', 'html', 'bash')",
            "expected_output": "A short string representing the exact expected stdout, or a description of expected behavior for UI tasks."
        }}
        """
        
        try:
            print(f"DEBUG: Generating {difficulty} challenge for {role} via Groq...")
            response = generate_ai_response(prompt)
            
            # Find the JSON block
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end != -1:
                json_str = response[start:end]
                challenge = json.loads(json_str)
                print(f"DEBUG: AI Challenge Generated: {challenge['title']}")
                return challenge
                
            raise ValueError("Invalid JSON format from AI")
            
        except Exception as e:
            print(f"ERROR [CodingService]: AI Generation failed ({str(e)}). Falling back to static.")
            return CodingService.STATIC_CHALLENGES.get(role, CodingService.STATIC_CHALLENGES["Backend Developer"])

    @staticmethod
    def evaluate_with_ai(role, language, code, output):
        """
        Uses Groq AI to evaluate the submission.
        """
        prompt = f"""
        As an expert AI Coding Interviewer, evaluate the following coding submission:
        
        Role: {role}
        Language: {language}
        Problem: {role} Assessment
        Code Provided:
        {code}
        
        Execution Output: {output}
        
        Scoring Criteria (Max 100):
        1. Code Quality (Readable, Best Practices): 20 pts
        2. Logic Efficiency: 20 pts
        3. Execution Performance: 10 pts
        4. Syntax Accuracy: 10 pts
        5. Correct Output (Comparison with expectations): 40 pts
        
        Return a JSON response *only* in the following format:
        {{
            "overall_score": 85,
            "pass_fail": "PASS",
            "quality_score": 18,
            "logic_score": 17,
            "performance_score": 9,
            "syntax_score": 10,
            "skill_level": "Intermediate",
            "strengths": ["Clean structure", "Modular code"],
            "weak_areas": ["Validation logic could be tighter"],
            "suggestions": ["Use arrow functions", "Optimize loop"]
        }}
        """
        
        try:
            response = generate_ai_response(prompt)
            # Find the JSON block in the AI response
            start = response.find("{")
            end = response.rfind("}") + 1
            if start != -1 and end != -1:
                json_str = response[start:end]
                return json.loads(json_str)
            return {"error": "Failed to parse AI evaluation."}
        except Exception as e:
            return {"error": str(e)}
