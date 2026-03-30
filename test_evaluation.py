import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.interview_service import evaluate_answer_nlp

try:
    print("Testing Answer Evaluation with Groq...")
    eval_res = evaluate_answer_nlp(
        "Explain the difference between a process and a thread.",
        "A process is a program in execution, while a thread is a unit of execution within a process. Threads share the same address space, making them lightweight compared to processes.",
        "Operating Systems"
    )
    if eval_res:
        print(f"SUCCESS: Evaluation Score: {eval_res.get('overall_score')}")
        print(f"Feedback: {eval_res.get('feedback')}")
    else:
        print("FAILED: No evaluation returned.")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
