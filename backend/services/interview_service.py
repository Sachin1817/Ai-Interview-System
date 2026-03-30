import random
import datetime
import os
import json
from .ai_service import generate_ai_response
from .question_bank import QUESTION_BANK, COMMON_QUESTIONS

# genai configuration removed, handled by ai_service

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



# Role → relevant topic keywords for question prioritization
ROLE_TOPIC_MAP = {
    # CSE / IT
    "Software Engineer":       ["Data Structures", "Algorithms", "OOP", "System Design"],
    "Full Stack Developer":    ["Databases", "Networking", "OOP", "Web", "System Design"],
    "Data Scientist":          ["Algorithms", "Data Structures", "Statistics", "Machine Learning"],
    "Backend Engineer":        ["Databases", "Networking", "System Design", "OOP"],
    "DevOps Engineer":         ["Networking", "System Design", "Linux", "Cloud"],
    "ML Engineer":             ["Algorithms", "Machine Learning", "Data Structures"],
    "Cloud Engineer":          ["Networking", "System Design", "Cloud", "Databases"],
    "Network Engineer":        ["Networking", "Security", "Protocols"],
    "Cybersecurity Analyst":   ["Security", "Networking", "OOP"],
    "IT Consultant":           ["System Design", "Networking", "Databases"],
    "System Admin":            ["Networking", "Linux", "Operating Systems"],
    # ECE
    "Embedded Engineer":       ["Microcontrollers", "Embedded C", "Digital Electronics"],
    "VLSI Designer":           ["VLSI", "Digital Electronics", "Circuits"],
    "IoT Engineer":            ["Microcontrollers", "Networking", "Embedded C"],
    "Signal Processing Engineer": ["Signal Processing", "Digital Electronics"],
    "RF Engineer":             ["Circuits", "RF", "Signal Processing"],
    # EEE
    "Power Systems Engineer":  ["Power Systems", "Electrical Machines"],
    "Control Engineer":        ["Control Systems", "Signals"],
    "Electrical Design Engineer": ["Circuits", "Power Systems"],
    "PLC Programmer":          ["Control Systems", "PLC", "Automation"],
    # Mechanical
    "Design Engineer":         ["CAD", "Engineering Drawing", "FEA"],
    "Manufacturing Engineer":  ["Manufacturing", "Materials", "Thermodynamics"],
    "Automotive Engineer":     ["Thermodynamics", "Mechanics"],
    "Thermal Engineer":        ["Thermodynamics", "Heat Transfer"],
    "CAD Engineer":            ["CAD", "Engineering Drawing"],
    # Civil
    "Structural Engineer":     ["Structural", "RCC Design"],
    "Site Engineer":           ["Construction", "Structural"],
    "BIM Engineer":            ["AutoCAD", "BIM"],
    "Urban Planner":           ["Survey", "Planning"],
    "Construction Manager":    ["Construction", "Project Management"],
    # Chemical
    "Process Engineer":        ["Process Design", "Thermodynamics"],
    "Chemical Plant Engineer": ["Process Design", "Safety"],
    "Safety Engineer":         ["Safety", "Process Design"],
    "R&D Chemist":             ["Chemistry", "Reaction Engineering"],
    # Aerospace
    "Aerospace Engineer":      ["Aerodynamics", "Structures"],
    "Avionics Engineer":       ["Electronics", "Control Systems"],
    "CFD Analyst":             ["Aerodynamics", "Fluid Mechanics"],
    "Propulsion Engineer":     ["Propulsion", "Thermodynamics"],
    "Structures Engineer":     ["Structures", "FEA"],
}

def get_branch_roles(branch):
    """Return roles mapped to a given engineering branch."""
    branch_info = {
        'CSE': ['Software Engineer', 'Full Stack Developer', 'Data Scientist', 'Backend Engineer', 'DevOps Engineer', 'ML Engineer'],
        'IT': ['Cloud Engineer', 'Network Engineer', 'Cybersecurity Analyst', 'IT Consultant', 'System Admin'],
        'ECE': ['Embedded Engineer', 'VLSI Designer', 'IoT Engineer', 'Signal Processing Engineer', 'RF Engineer'],
        'EEE': ['Power Systems Engineer', 'Control Engineer', 'Electrical Design Engineer', 'PLC Programmer'],
        'Mechanical': ['Design Engineer', 'Manufacturing Engineer', 'Automotive Engineer', 'Thermal Engineer', 'CAD Engineer'],
        'Civil': ['Structural Engineer', 'Site Engineer', 'BIM Engineer', 'Urban Planner', 'Construction Manager'],
        'Chemical': ['Process Engineer', 'Chemical Plant Engineer', 'Safety Engineer', 'R&D Chemist'],
        'Aerospace': ['Aerospace Engineer', 'Avionics Engineer', 'CFD Analyst', 'Propulsion Engineer', 'Structures Engineer'],
    }
    return branch_info.get(branch, ["Software Engineer", "Systems Engineer"])

def get_interview_questions(branch, difficulty, role=None, resume_skills=None, n=10):
    """
    Generate n unique interview questions using Gemini AI.
    """
    print(f"DEBUG: Generating {n} interview questions for {branch} - {role} ({difficulty})")
    # Generate a unique seed for this session to ensure randomness
    random_seed = f"{datetime.datetime.now().timestamp()}_{branch}_{role}"
    
    try:
        prompt = f"""
        You are an elite technical interviewer at a top-tier global firm (like Google, NVIDIA, or Tesla).
        Generate exactly {n} high-quality, professional, and detailed interview questions for a candidate with this profile:
        - Branch: {branch}
        - Target Role: {role or 'General Engineer'}
        - Difficulty Level: {difficulty}
        - RANDOMNESS_SEED: {random_seed} (USE THIS TO ENSURE TRULY UNIQUE QUESTIONS)
        
        CRITICAL STYLE REQUIREMENTS (NON-NEGOTIABLE):
        1. INFINITE VARIETY: Do NOT repeat common, cliché, or frequently asked questions. Every question must be uniquely tailored to the specific intersection of '{branch}' and '{role}'.
        2. NO SHORT QUESTIONS: Every question must be a well-structured paragraph of 3-4 sentences. Provide real-world context, a specific engineering scenario, or explain the critical importance of a concept before asking the question.
        3. ROLE-DEEP-DIVE: The questions MUST strictly focus on the deep technical competencies of a '{role}'. 
           Ex: For a Full Stack Developer, don't just ask about HTML. Ask about state management performance in large-scale React apps or database indexing strategies for real-time systems.
        4. STRUCTURE: 
           - {n-1} technical/domain-specific questions.
           - 1 complex behavioral/situation-based question tailored specifically to the '{role}' job environment.
        5. LEVEL APPROPRIATE: Maintain '{difficulty}' level depth but always with professional, long-form phrasing.
        
        The output must be pure, valid JSON in the following structure:
        [
            {{
                "id": "q1",
                "question": "The detailed 3-4 sentence question text here?",
                "topic": "The specific sub-topic"
            }},
            ...
        ]
        Do not output any introductory or concluding text, ONLY the JSON array.
        """
        
        raw_text = generate_ai_response(prompt)
        if not raw_text:
             raise ValueError("AI Service failed to generate interview questions")
        
        questions = _clean_json_response(raw_text)
        if not questions:
            raise ValueError(f"Failed to parse AI response as JSON. Raw text: {raw_text}")
        
        # Ensure ID uniqueness and format
        for i, q in enumerate(questions):
            q['id'] = f"ai_int_{i}_{datetime.datetime.now().microsecond}"
            
        return questions[:n]
        
    except Exception as e:
        print(f"AI Interview Generation Error: {e}. Falling back to static bank.")
        # Fallback to current static logic
        branch_data = QUESTION_BANK.get(branch, QUESTION_BANK.get("CSE"))
        domain_pool = branch_data.get(difficulty, branch_data.get("Beginner", []))
        technical_qs = random.sample(domain_pool, min(n-1, len(domain_pool)))
        hr_pool = COMMON_QUESTIONS.get("HR", [])
        hr_qs = random.sample(hr_pool, 1) if hr_pool else []
        
        results = technical_qs + hr_qs
        random.shuffle(results)
        return results[:n]

def evaluate_answer_nlp(question, answer, topic):
    """
    LLM-powered answer evaluation for the interview.
    """
    if not answer or len(answer.strip()) < 5:
        return {
            "technical_score": 0, "relevance_score": 0, "completeness_score": 0,
            "communication_score": 2, "confidence_score": 0, "overall_score": 1,
            "feedback": "No answer provided or answer too short."
        } if not answer else {
            "technical_score": 0, "relevance_score": 0, "completeness_score": 0,
            "communication_score": 2, "confidence_score": 0, "overall_score": 1,
            "feedback": "The answer is too brief to indicate any understanding."
        }

    try:
        prompt = f"""
        You are an expert technical interviewer evaluating a candidate's answer.
        Question: {question}
        Topic: {topic}
        Candidate's Answer: {answer}
        
        Evaluate the answer strictly on a scale of 0 to 10 for the following metrics:
        1. technical_score: Accuracy of the technical concepts.
        2. relevance_score: How well it directly addresses the question.
        3. completeness_score: Whether it covers all parts of the question.
        4. communication_score: Clarity, grammar, and professional tone.
        5. confidence_score: The decisiveness of the answer.
        
        Provide constructive, specific feedback (1-2 sentences) as 'feedback'.
        
        Output MUST be pure JSON with these keys: 
        technical_score, relevance_score, completeness_score, communication_score, confidence_score, overall_score, feedback.
        overall_score should be a weighted average (Accuracy 40%, Relevance 30%, Completeness 20%, Communication 10%).
        """
        
        raw_text = generate_ai_response(prompt)
        if not raw_text:
             raise ValueError("AI Service failed to evaluate answer")
        
        try:
            result = _clean_json_response(raw_text)
            if not result:
                raise ValueError("Could not extract JSON from AI response")
            # Sanitize: ensure all scores are floats and within 0-10
            for key in ["technical_score", "relevance_score", "completeness_score", "communication_score", "confidence_score", "overall_score"]:
                try:
                    result[key] = float(result.get(key, 0))
                    result[key] = max(0, min(10, result[key]))
                except:
                    # Provide a more realistic average score rather than just 1.0 if parsing fails
                    result[key] = 5.0
            
            print(f"DEBUG: Successfully evaluated answer. Score: {result['overall_score']}")
            return result
        except Exception as parse_error:
            print(f"JSON Parse Error in AI response: {parse_error}")
            raise parse_error
        
    except Exception as e:
        import traceback
        print(f"CRITICAL AI Evaluation Error: {str(e)}")
        traceback.print_exc()
        print(f"AI Evaluation Falling back to keyword matching for answer: {answer[:50]}...")
        # Minimal keyword fallback logic (simplified version of the old one)
        answer_lower = answer.lower()
        if any(kw in answer_lower for kw in ["explain", "use", "describe", "work", "concept"]):
            score = 5.5
            feedback = "Good attempt, but could be more structured."
        else:
            score = 3.0
            feedback = "Try to use more technical terminology and provide more context."
            
        return {
            "technical_score": score, "relevance_score": score, "completeness_score": score,
            "communication_score": score, "confidence_score": score, "overall_score": score,
            "feedback": feedback
        }


def generate_interview_result(answers_with_scores, branch, difficulty):
    """Generate a comprehensive final interview result report."""
    if not answers_with_scores:
        return {}

    scores = [a["evaluation"]["overall_score"] for a in answers_with_scores]
    overall = round(sum(scores) / len(scores), 1)

    tech_scores = [a["evaluation"]["technical_score"] for a in answers_with_scores]
    comm_scores = [a["evaluation"]["communication_score"] for a in answers_with_scores]
    avg_tech = round(sum(tech_scores) / len(tech_scores), 1)
    avg_comm = round(sum(comm_scores) / len(comm_scores), 1)

    # Identify strengths and weak topics
    topic_scores = {}
    for a in answers_with_scores:
        topic = a.get("topic", "General")
        if topic not in topic_scores:
            topic_scores[topic] = []
        topic_scores[topic].append(a["evaluation"]["overall_score"])

    avg_by_topic = {t: round(sum(s) / len(s), 1) for t, s in topic_scores.items()}
    strengths = [t for t, s in avg_by_topic.items() if s >= 7.0]
    weak_topics = [t for t, s in avg_by_topic.items() if s < 5.0]

    # Job readiness
    if overall >= 8:
        readiness = "Placement Ready ✅"
        readiness_color = "emerald"
    elif overall >= 6:
        readiness = "Near Ready 🎯"
        readiness_color = "yellow"
    else:
        readiness = "Needs Improvement 📚"
        readiness_color = "red"

    # Roadmap suggestions
    roadmap = []
    if weak_topics:
        roadmap.append(f"Focus on improving: {', '.join(weak_topics[:3])}")
    roadmap.append("Practice mock interviews weekly")
    roadmap.append("Build 2-3 projects related to your domain")
    if avg_comm < 6:
        roadmap.append("Work on communication: speak clearly and structure answers with STAR method")

    return {
        "overall_score": overall,
        "domain_score": avg_tech,
        "communication_score": avg_comm,
        "strengths": strengths if strengths else ["Good attempt across all topics"],
        "weak_topics": weak_topics if weak_topics else [],
        "job_readiness": readiness,
        "readiness_color": readiness_color,
        "improvement_roadmap": roadmap,
        "branch": branch,
        "difficulty": difficulty,
        "questions_attempted": len(answers_with_scores),
    }
