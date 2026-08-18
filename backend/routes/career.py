from flask import Blueprint, request, jsonify
from services.career_service import get_career_advice, get_job_recommendations, match_job_with_ai
from utils.auth_helper import token_required
from utils.db import get_db
from bson.objectid import ObjectId
import datetime

career_bp = Blueprint('career', __name__)
db = get_db()
resumes_col = db['resumes']
scores_col = db['scores']
users_col = db['users']
coding_col = db['coding_submissions']
assessment_col = db['assessment_scores']


@career_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(user_id):
    """
    Composite leaderboard: Interview 30% + Resume ATS 25% + Assessment 25% + Coding 20%
    Query params: branch (optional), period (week/month/all)
    """
    branch_filter = request.args.get('branch', '')
    period = request.args.get('period', 'all')

    # Date cutoff
    cutoff = None
    now = datetime.datetime.utcnow()
    if period == 'week':
        cutoff = now - datetime.timedelta(days=7)
    elif period == 'month':
        cutoff = now - datetime.timedelta(days=30)

    # Fetch all non-HR users
    user_query = {"role": {"$ne": "hr"}}
    if branch_filter:
        user_query["branch"] = branch_filter
    all_users = list(users_col.find(user_query, {"_id": 1, "name": 1, "email": 1, "branch": 1}))

    leaderboard = []
    caller_rank = None

    for u in all_users:
        uid = str(u['_id'])

        # Skip test users
        name = u.get('name', '')
        email = u.get('email', '')
        if any(x in name.lower() or x in email.lower() for x in ['test', 'tester', 'mock']):
            continue

        # Interview score (best of recent sessions, /10 → /100)
        score_q = {"user_id": uid}
        if cutoff:
            score_q["completed_at"] = {"$gte": cutoff}
        best_interview = scores_col.find_one(score_q, sort=[("overall_score", -1)])
        interview_score = (best_interview.get("overall_score", 0) * 10) if best_interview else 0

        # Resume ATS score (/100)
        resume = resumes_col.find_one({"user_id": uid})
        ats_score = resume["diagnosis"].get("score", 0) if resume and resume.get("diagnosis") else 0

        # Assessment score (latest, /10 → /100)
        assess_q = {"user_id": uid}
        if cutoff:
            assess_q["completed_at"] = {"$gte": cutoff}
        best_assess = assessment_col.find_one(assess_q, sort=[("score", -1)])
        assessment_score = (best_assess.get("score", 0) * 10) if best_assess else 0

        # Coding score: count passed challenges (each = 10 pts, max 100)
        coding_q = {"user_id": uid, "result.passed": True}
        if cutoff:
            coding_q["submitted_at"] = {"$gte": cutoff}
        coding_passed = coding_col.count_documents(coding_q)
        coding_score = min(coding_passed * 10, 100)

        # Composite
        composite = round(
            interview_score * 0.30 +
            ats_score * 0.25 +
            assessment_score * 0.25 +
            coding_score * 0.20,
            1
        )

        # Anonymize name: "Sachin D." format
        parts = name.strip().split()
        anon_name = parts[0] if parts else "User"
        if len(parts) > 1:
            anon_name += f" {parts[-1][0]}."

        leaderboard.append({
            "user_id": uid,
            "name": anon_name,
            "branch": u.get("branch", "CSE"),
            "composite": composite,
            "interview_score": round(interview_score, 1),
            "ats_score": round(ats_score, 1),
            "assessment_score": round(assessment_score, 1),
            "coding_score": round(coding_score, 1),
            "is_me": uid == user_id,
        })

    # Sort descending
    leaderboard.sort(key=lambda x: x["composite"], reverse=True)

    # Assign rank and find caller's rank
    for i, entry in enumerate(leaderboard):
        entry["rank"] = i + 1
        if entry["is_me"]:
            caller_rank = i + 1

    return jsonify({
        "leaderboard": leaderboard[:50],   # top 50
        "my_rank": caller_rank,
        "total": len(leaderboard),
    }), 200


@career_bp.route('/advice', methods=['GET'])
@token_required
def career_advice(user_id):
    """
    Get personalized career advice based on user's resume skills and branch.
    Reads the user's stored resume diagnosis from MongoDB.
    """
    # Safely look up user — user_id may be string or ObjectId depending on auth helper
    try:
        user = db['users'].find_one({"_id": ObjectId(user_id)}) or {}
    except Exception:
        user = db['users'].find_one({"_id": user_id}) or {}

    branch = user.get("branch", "CSE")
    skills = []

    # Try resume by user_id as string first (how it's stored when inserted)
    resume = resumes_col.find_one({"user_id": user_id})
    if resume and resume.get("diagnosis"):
        skills = resume["diagnosis"].get("skills", [])

    # Get latest interview score (optional context)
    assessment_score = None
    latest_score = scores_col.find_one({"user_id": user_id}, sort=[("completed_at", -1)])
    if latest_score:
        raw = latest_score.get("overall_score", None)
        if raw is not None:
            assessment_score = raw * 10   # /10 → /100

    advice = get_career_advice(branch, skills, assessment_score)
    return jsonify(advice), 200

@career_bp.route('/advice/branch', methods=['POST'])
def career_advice_by_branch():
    """
    Get career advice for a specific branch without auth (for demo use).
    """
    data = request.get_json()
    branch = data.get("branch", "CSE")
    skills = data.get("skills", [])
    advice = get_career_advice(branch, skills)
    return jsonify(advice), 200

@career_bp.route('/analytics', methods=['GET'])
@token_required
def get_analytics(user_id):
    """
    Return aggregated analytics data: interview history, resume score, assessment history.
    """
    # Interview history (last 10)
    interview_history = list(
        scores_col.find({"user_id": user_id}).sort("completed_at", -1).limit(10)
    )
    for h in interview_history:
        h['_id'] = str(h['_id'])
        if 'completed_at' in h:
            h['completed_at'] = str(h['completed_at'])

    # Resume score
    resume = resumes_col.find_one({"user_id": user_id})
    resume_score = resume["diagnosis"]["score"] if resume and resume.get("diagnosis") else 0
    resume_skills = resume["diagnosis"].get("skills", []) if resume and resume.get("diagnosis") else []

    # Trend data for chart
    trend = [
        {
            "label": f"Interview {i+1}",
            "session_id": h.get("session_id", ""),
            "overall": h.get("overall_score", 0),
            "domain": h.get("domain_score", 0),
            "communication": h.get("communication_score", 0),
            "branch": h.get("branch", ""),
            "difficulty": h.get("difficulty", ""),
        }
        for i, h in enumerate(reversed(interview_history))
    ]

    return jsonify({
        "resume_score": resume_score,
        "resume_skills": resume_skills,
        "interview_trend": trend,
        "total_interviews": len(interview_history),
        "best_score": max((h.get("overall_score", 0) for h in interview_history), default=0),
        "latest_score": interview_history[0].get("overall_score", 0) if interview_history else 0,
    }), 200

@career_bp.route('/jobs/recommendations', methods=['POST'])
@token_required
def jobs_recommendations(user_id):
    """
    Private route to get job suggestions.
    Analyzes the user's resume location/locality to find jobs nearby.
    """
    data = request.get_json() or {}
    branch = data.get("branch", "CSE")
    role = data.get("role")
    skills = data.get("skills", [])
    location = data.get("location")
    
    # 1. Analyze user resume to extract location/locality
    extracted_location = None
    try:
        resume = resumes_col.find_one({"user_id": user_id})
        if resume:
            diagnosis = resume.get("diagnosis", {})
            extracted_location = diagnosis.get("location")
            
            # If not already cached/extracted in diagnosis, extract on-the-fly from raw resume text
            if not extracted_location and resume.get("text"):
                from services.ai_service import generate_ai_response
                prompt = f"""
                You are a location extraction expert.
                Extract the candidate's current city/state/country (locality) from the following resume text.
                
                RESUME TEXT:
                {resume.get("text")}
                
                Output ONLY the location as a single string (e.g., "Mumbai, Maharashtra", "Bengaluru", "New Delhi").
                If no location or contact address is present in the resume, return "India".
                Do not include any other words, preamble, or markdown formatting.
                """
                loc_res = generate_ai_response(prompt)
                if loc_res:
                    extracted_location = loc_res.strip()
                    # Cache the location in the diagnosis dictionary
                    diagnosis["location"] = extracted_location
                    resumes_col.update_one({"user_id": user_id}, {"$set": {"diagnosis": diagnosis}})
    except Exception as e:
        print(f"DEBUG [Jobs]: Error extracting location from resume: {e}")

    # Use the extracted location if available, otherwise fall back to location from payload, otherwise "India"
    final_location = extracted_location or location or "India"
    print(f"DEBUG [Jobs]: Finding jobs for role={role or branch} in location={final_location}")
    
    jobs = get_job_recommendations(branch, role, skills, final_location)
    return jsonify(jobs), 200

@career_bp.route('/jobs/match', methods=['POST'])
def job_match():
    """
    Trigger AI analysis for a specific job compared to user skills.
    """
    data = request.get_json()
    job = data.get("job")
    skills = data.get("skills", [])
    resume_score = data.get("resume_score", 0)
    
    if not job:
        return jsonify({"error": "Job data required"}), 400
        
    match_result = match_job_with_ai(job, skills, resume_score)
    return jsonify(match_result), 200

@career_bp.route('/chat', methods=['POST'])
def career_assistant_chat():
    """
    Floating AI career assistant endpoint.
    Expects: { message, userSkills, predictedRole, hiringLevel, branch }
    """
    from services.career_service import chat_with_career_assistant
    
    data = request.get_json()
    message = data.get("message")
    skills = data.get("userSkills", [])
    role = data.get("predictedRole", "")
    hiring_level = data.get("hiringLevel", "")
    branch = data.get("branch", "General")
    history = data.get("history", [])
    language = data.get("language", "English")
    
    if not message:
        return jsonify({"error": "Message required"}), 400
        
    result = chat_with_career_assistant(message, skills, branch, role, hiring_level, history, language)
    return jsonify(result), 200

