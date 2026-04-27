import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from services.ai_service import generate_ai_response
from routes.assessment import _clean_json_response

prompt = """
You are an expert examiner for placement and professional certification exams.
Generate exactly 2 high-quality, unique, non-repeating multiple-choice questions for:
Category: Technical
Branch: CSE
Topic: Python
Difficulty: Beginner

CRITICAL REQUIREMENTS:
1. Ensure questions are diverse and cover different aspects of the topic.
2. Do NOT repeat the same concept in multiple questions.
3. Make the questions challenging but appropriate for the Beginner level.
4. Include a mix of theoretical and practical/application-based questions.
5. For technical topics, include snippets or scenario-based problems.

The output must be a valid JSON array of objects. Do not include any text outside the JSON array.
Structure:
[
    {
        "q": "The question text",
        "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
        "answer": "Option 1",
        "topic": "Python"
    }
]
Crucial: "answer" MUST be the exact string from the "options" array, not an index. Use "q" for question text.
"""

print("Calling Groq...")
res = generate_ai_response(prompt)
print("--- Raw Response ---")
print(res)
print("--------------------")

cleaned = _clean_json_response(res)
print("--- Cleaned Response ---")
print(cleaned)
