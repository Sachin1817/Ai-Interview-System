import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.interview_service import get_interview_questions

try:
    print("Testing Interview Question Generation with Groq...")
    questions = get_interview_questions("CSE", "Intermediate", role="Full Stack Developer")
    if questions and len(questions) > 0:
        print(f"SUCCESS: Generated {len(questions)} questions.")
        for i, q in enumerate(questions):
            print(f"{i+1}. {q.get('topic')}: {q.get('question')[:60]}...")
    else:
        print("FAILED: No questions returned.")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
