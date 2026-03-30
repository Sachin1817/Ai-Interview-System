import sys
import os
import json

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.career_service import get_career_advice

def test_career_advice():
    print("Testing AI Career Advice with Groq...")
    
    test_cases = [
        {
            "branch": "CSE",
            "skills": ["Python", "Flask", "React", "MongoDB", "Git"],
            "assessment_score": 85,
            "label": "Full Stack Dev Profile"
        },
        {
            "branch": "Mechanical",
            "skills": ["AutoCAD", "SolidWorks", "Python"],
            "assessment_score": 40,
            "label": "Mechanical with some Python"
        }
    ]

    for tc in test_cases:
        print(f"\n--- Testing: {tc['label']} ---")
        try:
            result = get_career_advice(tc['branch'], tc['skills'], tc['assessment_score'])
            print(f"Top Role: {result.get('best_role')}")
            print(f"Match %: {result.get('top_roles')[0].get('match_percentage')}%")
            print(f"Roadmap steps: {len(result.get('improvement_roadmap', []))}")
            
            # Check if match is 0 (it should NOT be 0 if the AI is working)
            if result.get('top_roles')[0].get('match_percentage') > 0:
                print("SUCCESS: Dynamic match percentage generated.")
            else:
                print("WARNING: Match percentage is 0. AI might have failed or been overly critical.")
                
            print("Actionable Roadmap Sample:", result.get('improvement_roadmap', [])[0])
            
        except Exception as e:
            print(f"ERROR testing {tc['label']}: {e}")

if __name__ == "__main__":
    test_career_advice()
