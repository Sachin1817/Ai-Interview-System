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
        if not raw_text:
            return None
            
        # 1. Clean up markdown blocks if present
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
            
        # 2. Try to find the first '{' or '[' and the last '}' or ']'
        start_obj = raw_text.find('{')
        start_arr = raw_text.find('[')
        
        # Decide which one to look for
        if start_obj != -1 and (start_arr == -1 or start_obj < start_arr):
            start = start_obj
            end = raw_text.rfind('}')
        elif start_arr != -1:
            start = start_arr
            end = raw_text.rfind(']')
        else:
            # Try direct load
            return json.loads(raw_text.strip())
            
        if start != -1 and end != -1:
            json_str = raw_text[start:end+1]
            return json.loads(json_str)
            
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"CRITICAL [Parsing Error]: {e} | Raw segment: {raw_text[:100]}...")
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

def get_interview_questions(branch, difficulty="Beginner", role=None, round_type="Technical", n=5):
    """
    Generate dynamic, diverse, and contextual interview questions via Groq Cloud AI.
    Supports Technical, Behavioral (STAR Method), and Mixed rounds.
    """
    role_topics = ROLE_TOPIC_MAP.get(role, []) if role else []
    role_context = f" targeting the '{role}' role (key topics: {', '.join(role_topics)})" if role and role_topics else ""
    random_seed = f"{datetime.datetime.now().timestamp()}_{branch}_{role}_{round_type}"

    try:
        if round_type in ["Behavioral", "STAR"]:
            prompt = f"""
            You are an executive HR and technical leadership interviewer conducting a behavioral interview using the STAR method (Situation, Task, Action, Result).
            Generate exactly {n} distinct behavioral interview questions as a JSON array.

            Candidate Profile:
            - Engineering Branch: {branch}
            - Target Role: {role or 'Software Engineer'}{role_context}
            - Seniority Level: {difficulty}
            - Diversity Seed: {random_seed}

            Question Criteria:
            1. Scenarios must test core workplace competencies: Leadership, Conflict Resolution, Overcoming Failure, Tight Deadlines, and Cross-functional Teamwork.
            2. Each question should start with prompts like "Tell me about a time when...", "Describe a scenario where...", or "Give an example of how you handled...".
            3. Questions must feel authentic to {role or 'Engineering'} projects.
            4. Include a helpful STAR guide hint for each question.

            Output format JSON ONLY:
            [
                {{
                    "id": "q1",
                    "question": "Describe a time when you discovered a critical bug right before a major release. How did you handle the situation and stakeholders?",
                    "topic": "Handling Crisis & Deadlines",
                    "round_type": "Behavioral",
                    "star_hint": "Outline the release emergency (Situation/Task), your mitigation & communication plan (Action), and the eventual outcome & preventative fixes (Result)."
                }}
            ]
            """
        elif round_type == "Mixed":
            prompt = f"""
            You are an elite interviewer. Generate exactly {n} interview questions as a JSON array ({n-2} Technical questions and 2 Behavioral STAR questions).

            Candidate Profile:
            - Branch: {branch}
            - Target Role: {role or 'General Engineer'}{role_context}
            - Difficulty: {difficulty}
            - Diversity Seed: {random_seed}

            Output format JSON ONLY:
            [
                {{
                    "id": "q1",
                    "question": "Question text...",
                    "topic": "Sub-topic",
                    "round_type": "Technical",
                    "star_hint": ""
                }}
            ]
            """
        else:
            prompt = f"""
            You are an elite technical interviewer. Generate exactly {n} technical interview questions as a JSON array.
            
            Candidate Profile:
            - Branch: {branch}
            - Target Role: {role or 'General Engineer'}{role_context}
            - Difficulty: {difficulty}
            - Diversity Seed: {random_seed}
            
            Requirements:
            1. Contextual & Unique: 2-3 sentences long, describing a realistic system design, debugging, or optimization scenario.
            2. High relevance to the selected target role ({role or 'General Engineer'}).
            3. Difficulty Alignment: Matches the '{difficulty}' level.
            4. No Repetition across questions.
            
            Output format JSON ONLY:
            [
                {{
                    "id": "q1",
                    "question": "Question text...",
                    "topic": "Sub-topic",
                    "round_type": "Technical",
                    "star_hint": ""
                }}
            ]
            """

        raw_text = generate_ai_response(prompt)
        if not raw_text:
            raise ValueError("AI Service failed to generate interview questions")

        questions = _clean_json_response(raw_text)
        if not questions:
            raise ValueError(f"Failed to parse AI response as JSON. Raw text: {raw_text}")

        for i, q in enumerate(questions):
            q['id'] = f"ai_int_{i}_{datetime.datetime.now().microsecond}"
            if 'round_type' not in q:
                q['round_type'] = round_type

        return questions[:n]

    except Exception as e:
        print(f"AI Interview Generation Error: {e}. Falling back to static bank.")
        # Fallback to static logic, filtered by role topics if possible
        branch_data = QUESTION_BANK.get(branch, QUESTION_BANK.get("CSE"))
        domain_pool = branch_data.get(difficulty, branch_data.get("Beginner", []))
        
        role_pool = []
        if role and role_topics:
            role_topics_lower = [t.lower() for t in role_topics]
            role_pool = [q for q in domain_pool if q.get("topic", "").lower() in role_topics_lower]
        
        if len(role_pool) >= n - 1:
            technical_qs = random.sample(role_pool, n - 1)
        else:
            remaining_needed = (n - 1) - len(role_pool)
            general_pool = [q for q in domain_pool if q not in role_pool]
            sample_size = min(remaining_needed, len(general_pool))
            technical_qs = role_pool + random.sample(general_pool, sample_size)
            
        hr_pool = COMMON_QUESTIONS.get("HR", [])
        hr_qs = random.sample(hr_pool, 1) if hr_pool else []
        
        results = technical_qs + hr_qs
        random.shuffle(results)
        return results[:n]

def evaluate_answer_nlp(question, answer, topic, round_type="Technical"):
    """
    LLM-powered answer evaluation with STAR (Situation, Task, Action, Result) breakdown when applicable.
    """
    if not answer or len(answer.strip()) < 5:
        return {
            "technical_score": 0.0, "relevance_score": 0.0, "completeness_score": 0.0,
            "communication_score": 0.0, "confidence_score": 0.0, "overall_score": 0.0,
            "situation_score": 0.0, "task_score": 0.0, "action_score": 0.0, "result_score": 0.0,
            "star_breakdown": {"situation": "Missing", "task": "Missing", "action": "Missing", "result": "Missing"},
            "feedback": "No answer provided or answer too short."
        }

    is_star = round_type in ["Behavioral", "STAR"] or any(
        kw in topic.lower() for kw in ["behavioral", "leadership", "conflict", "crisis", "teamwork", "hr", "star"]
    )

    try:
        if is_star:
            prompt = f"""
            You are a senior hiring manager and executive behavioral coach.
            Evaluate the candidate's response to the behavioral question using the STAR framework (Situation, Task, Action, Result).

            Question: {question}
            Competency/Topic: {topic}
            Candidate's Answer: {answer}

            Analyze strictly on a scale of 0 to 10 for:
            1. situation_score: Clear context, background, and stakes.
            2. task_score: Clear personal responsibility and goals.
            3. action_score: Specific initiative, leadership, and technical/interpersonal steps taken.
            4. result_score: Quantifiable outcome, impact, lessons learned, and business value.
            5. communication_score: Articulation, structure, and professional tone.
            6. overall_score: Weighted composite (Situation 20%, Task 15%, Action 35%, Result 30%).

            Also extract the STAR breakdown summary (1 sentence each for Situation, Task, Action, Result) and specific coaching feedback with actionable tips.

            Output MUST be pure JSON format:
            {{
                "technical_score": 8.0,
                "relevance_score": 8.5,
                "completeness_score": 8.0,
                "communication_score": 8.5,
                "confidence_score": 8.0,
                "situation_score": 8.5,
                "task_score": 8.0,
                "action_score": 9.0,
                "result_score": 7.5,
                "overall_score": 8.4,
                "star_breakdown": {{
                    "situation": "Identified latency spike during Black Friday traffic surge.",
                    "task": "Owned database query optimization to bring p99 latency under 200ms.",
                    "action": "Profiled slow queries, introduced Redis caching layer, and optimized indexing.",
                    "result": "Reduced p99 latency by 64% with zero downtime during peak sales."
                }},
                "star_tip": "Quantify the business impact even more clearly (e.g. revenue protected or server costs saved).",
                "feedback": "Strong structured response demonstrating clear problem ownership and decisive technical action."
            }}
            """
        else:
            prompt = f"""
            You are an expert technical interviewer evaluating a candidate's answer.
            Question: {question}
            Topic: {topic}
            Candidate's Answer: {answer}
            
            Evaluate strictly on a scale of 0 to 10:
            1. technical_score: Accuracy of technical concepts.
            2. relevance_score: Direct responsiveness to the prompt.
            3. completeness_score: Thoroughness of explanation.
            4. communication_score: Clarity, structure, and professional terminology.
            5. confidence_score: Decisiveness and depth.
            6. overall_score: Weighted average (Tech 40%, Relevance 30%, Completeness 20%, Comm 10%).
            7. feedback: 1-2 constructive sentences.
            
            Output MUST be pure JSON format:
            {{
                "technical_score": 8.0,
                "relevance_score": 8.5,
                "completeness_score": 8.0,
                "communication_score": 8.0,
                "confidence_score": 8.0,
                "overall_score": 8.2,
                "feedback": "Clear explanation with good technical depth."
            }}
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

    # Advanced Roadmap Suggesstions
    roadmap = []
    if weak_topics:
        roadmap.append(f"Master {', '.join(weak_topics[:2])} fundamentals through practical implementations.")
        roadmap.append(f"Review core principles of {branch} Engineering with focus on {difficulty} concepts.")
    
    if avg_tech < 7:
        roadmap.append("Deep dive into system architecture and domain-specific edge cases.")
    
    if avg_comm < 6.5:
        roadmap.append("Enhance technical articulation using the STAR framework for behavioral responses.")
    
    roadmap.append("Engage in consistent daily coding and theoretical verification sessions.")
    
    return {
        "overall_score": overall,
        "domain_score": avg_tech,
        "communication_score": avg_comm,
        "strengths": strengths if strengths else ["Showing foundational potential"],
        "weak_topics": weak_topics if weak_topics else [],
        "job_readiness": readiness,
        "readiness_color": readiness_color,
        "improvement_roadmap": roadmap[:5], # Keep top 5 items
        "branch": branch,
        "difficulty": difficulty,
        "questions_attempted": len(answers_with_scores),
    }
