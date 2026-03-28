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
    data = request.get_json()
    branch = data.get('branch', 'CSE')
    difficulty = data.get('difficulty', 'Beginner')
    role = data.get('role', None)  # NEW: selected role

    questions = get_interview_questions(branch, difficulty, role=role)
    session_id = str(ObjectId())

    interviews_col.insert_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
        "branch": branch,
        "difficulty": difficulty,
        "role": role,
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
        "roles": get_branch_roles(branch)
    }), 200

@interview_bp.route('/evaluate', methods=['POST'])
@token_required
def evaluate_answer(user_id):
    data = request.get_json()
    session_id = data.get('session_id')
    question_id = data.get('question_id')
    question_text = data.get('question')
    answer = data.get('answer', '')
    topic = data.get('topic', 'General')

    # Defer evaluation until /submit
    answers_col.insert_one({
        "user_id": user_id,
        "session_id": session_id,
        "question_id": question_id,
        "question": question_text,
        "answer": answer,
        "topic": topic,
        "evaluation": None, # Will be filled on submit
        "answered_at": datetime.datetime.utcnow()
    })

    return jsonify({"message": "Answer received"}), 200

@interview_bp.route('/submit', methods=['POST'])
@token_required
def submit_interview(user_id):
    data = request.get_json()
    session_id = data.get('session_id')
    branch = data.get('branch', 'CSE')
    difficulty = data.get('difficulty', 'Beginner')

    # Get all answers for this session
    session_answers = list(answers_col.find({"user_id": user_id, "session_id": session_id}))
    
    # Process evaluations now
    evaluated_answers = []
    for ans in session_answers:
        if ans.get("evaluation") is None:
            evaluation = evaluate_answer_nlp(ans["question"], ans["answer"], ans["topic"])
            answers_col.update_one({"_id": ans["_id"]}, {"$set": {"evaluation": evaluation}})
            ans["evaluation"] = evaluation
        evaluated_answers.append({"topic": ans["topic"], "evaluation": ans["evaluation"]})

    result = generate_interview_result(evaluated_answers, branch, difficulty)

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
    history = list(scores_col.find({"user_id": user_id}).sort("completed_at", -1).limit(10))
    for h in history:
        h['_id'] = str(h['_id'])
    return jsonify(history), 200
