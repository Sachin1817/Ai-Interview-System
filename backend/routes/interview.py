from flask import Blueprint, request, jsonify
from services.interview_service import get_interview_questions, evaluate_answer_nlp, generate_interview_result, get_branch_roles
from utils.auth_helper import token_required
from utils.db import get_db
from bson.objectid import ObjectId
import datetime

interview_bp = Blueprint('interview', __name__)
db = get_db()
interviews_col = db['interviews']
answers_col = db['answers']
scores_col = db['scores']

@interview_bp.route('/start', methods=['POST'])
@token_required
def start_interview(user_id):
    data = request.get_json() or {}
    branch = data.get('branch', 'CSE')
    difficulty = data.get('difficulty', 'Beginner')
    role = data.get('role', None)
    round_type = data.get('round_type', 'Technical')

    questions = get_interview_questions(branch, difficulty, role=role, round_type=round_type)
    session_id = str(ObjectId())

    interviews_col.insert_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
        "branch": branch,
        "difficulty": difficulty,
        "role": role,
        "round_type": round_type,
        "questions": questions,
        "status": "active",
        "started_at": datetime.datetime.utcnow()
    })

    return jsonify({
        "session_id": session_id,
        "questions": questions,
        "branch": branch,
        "difficulty": difficulty,
        "role": role,
        "round_type": round_type,
        "roles": get_branch_roles(branch)
    }), 200

@interview_bp.route('/evaluate', methods=['POST'])
@token_required
def evaluate_answer(user_id):
    data = request.get_json() or {}
    session_id = data.get('session_id')
    question_id = data.get('question_id')
    question_text = data.get('question')
    answer = data.get('answer', '')
    topic = data.get('topic', 'General')
    round_type = data.get('round_type', 'Technical')

    # Defer evaluation until /submit
    answers_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "question_id": question_id,
        "question": question_text,
        "answer": answer,
        "topic": topic,
        "round_type": round_type,
        "evaluation": None, # Will be filled on submit
        "answered_at": datetime.datetime.utcnow()
    })

    return jsonify({"message": "Answer received"}), 200

@interview_bp.route('/submit', methods=['POST'])
@token_required
def submit_interview(user_id):
    data = request.get_json() or {}
    session_id = data.get('session_id')
    branch = data.get('branch', 'CSE')
    difficulty = data.get('difficulty', 'Beginner')
    round_type = data.get('round_type', 'Technical')

    # Get all answers for this session
    session_answers = list(answers_col.find({"user_id": user_id, "session_id": session_id}))
    
    # Process evaluations now
    evaluated_answers = []
    for ans in session_answers:
        if ans.get("evaluation") is None:
            ans_round_type = ans.get("round_type", round_type)
            evaluation = evaluate_answer_nlp(ans["question"], ans["answer"], ans["topic"], round_type=ans_round_type)
            answers_col.update_one({"_id": ans["_id"]}, {"$set": {"evaluation": evaluation}})
            ans["evaluation"] = evaluation
        evaluated_answers.append({"topic": ans["topic"], "evaluation": ans["evaluation"]})

    result = generate_interview_result(evaluated_answers, branch, difficulty)
    result["round_type"] = round_type

    # Save final score
    scores_col.update_one(
        {"user_id": user_id, "session_id": session_id},
        {"$set": {**result, "completed_at": datetime.datetime.utcnow()}},
        upsert=True
    )

    # Update interview status
    interviews_col.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "completed", "result": result}}
    )

    return jsonify(result), 200

@interview_bp.route('/history', methods=['GET'])
@token_required
def get_history(user_id):
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    skip = (page - 1) * per_page
    total = scores_col.count_documents({"user_id": user_id})
    history = list(scores_col.find({"user_id": user_id}).sort("completed_at", -1).skip(skip).limit(per_page))
    for h in history:
        h['_id'] = str(h['_id'])
        if 'completed_at' in h and isinstance(h['completed_at'], datetime.datetime):
            h['completed_at'] = h['completed_at'].isoformat()
    return jsonify({"history": history, "total": total, "page": page, "per_page": per_page}), 200


@interview_bp.route('/session/<session_id>/detail', methods=['GET'])
@token_required
def get_session_detail(user_id, session_id):
    """Return full Q&A + evaluations for a completed interview session."""
    # Fetch the interview session metadata
    session = None
    try:
        session = interviews_col.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    except Exception:
        pass
    if not session:
        return jsonify({"message": "Session not found"}), 404

    # Fetch all answers for this session
    raw_answers = list(answers_col.find({"user_id": user_id, "session_id": session_id}).sort("answered_at", 1))

    qa_pairs = []
    for ans in raw_answers:
        evaluation = ans.get("evaluation") or {}
        qa_pairs.append({
            "question": ans.get("question", ""),
            "topic": ans.get("topic", "General"),
            "answer": ans.get("answer", ""),
            "score": evaluation.get("score", 0),
            "feedback": evaluation.get("feedback", ""),
            "ideal_answer": evaluation.get("ideal_answer", ""),
            "strengths": evaluation.get("strengths", []),
            "improvements": evaluation.get("improvements", []),
        })

    # Fetch final score summary
    score_doc = scores_col.find_one({"user_id": user_id, "session_id": session_id}) or {}

    return jsonify({
        "session_id": session_id,
        "branch": session.get("branch", "General"),
        "difficulty": session.get("difficulty", "Intermediate"),
        "role": session.get("role", ""),
        "started_at": session.get("started_at", "").isoformat() if isinstance(session.get("started_at"), datetime.datetime) else str(session.get("started_at", "")),
        "qa_pairs": qa_pairs,
        "overall_score": score_doc.get("overall_score", 0),
        "domain_score": score_doc.get("domain_score", 0),
        "communication_score": score_doc.get("communication_score", 0),
        "total_questions": len(qa_pairs),
    }), 200


@interview_bp.route('/assigned', methods=['GET'])
@token_required
def get_assigned_interviews(user_id):
    assigned = list(interviews_col.find({"user_id": user_id, "is_manual_mode": True, "status": "assigned"}))
    for x in assigned:
        x['_id'] = str(x['_id'])
        if 'created_at' in x and isinstance(x['created_at'], datetime.datetime):
            x['created_at'] = x['created_at'].isoformat()
    return jsonify(assigned), 200

@interview_bp.route('/start-assigned', methods=['POST'])
@token_required
def start_assigned_interview(user_id):
    data = request.get_json()
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({"message": "Missing session_id"}), 400
        
    session = interviews_col.find_one({"_id": ObjectId(session_id), "user_id": user_id})
    if not session:
        return jsonify({"message": "Assigned interview not found"}), 404
        
    interviews_col.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"status": "active", "started_at": datetime.datetime.utcnow()}}
    )
    
    return jsonify({
        "session_id": str(session["_id"]),
        "questions": session.get("questions", []),
        "branch": session.get("branch", "CSE"),
        "difficulty": session.get("difficulty", "Intermediate"),
        "role": session.get("role", "Software Engineer"),
        "is_manual_mode": True,
        "interview_type": session.get("interview_type", "standard"),
        "coding_challenge": session.get("coding_challenge", None)
    }), 200
