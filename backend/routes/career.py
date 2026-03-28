from flask import Blueprint, request, jsonify
from services.career_service import get_career_advice
from utils.auth_helper import token_required
from utils.db import get_db
from bson.objectid import ObjectId

career_bp = Blueprint('career', __name__)
db = get_db()
resumes_col = db['resumes']
scores_col = db['scores']

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
