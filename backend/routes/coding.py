from flask import Blueprint, request, jsonify
from services.execution_service import ExecutionService
from services.coding_service import CodingService
from utils.auth_helper import token_required
from utils.db import get_db
import datetime
from bson import ObjectId

coding_bp = Blueprint('coding', __name__)
db = get_db()
submissions_col = db['coding_submissions']

@coding_bp.route('/generate', methods=['POST'])
@token_required
def generate_challenge(user_id):
    data = request.json
    role = data.get('role', 'Python Developer')
    difficulty = data.get('difficulty', 'Medium')
    
    challenge = CodingService.get_challenge_by_role(role, difficulty)
    return jsonify({
        "success": True,
        "challenge": challenge
    }), 200

@coding_bp.route('/run', methods=['POST'])
@token_required
def run_code(user_id):
    data = request.json
    language = data.get('language')
    code = data.get('code')
    
    if not language or not code:
        return jsonify({"error": "Missing language or code"}), 400
        
    result = ExecutionService.run_code(language, code)
    return jsonify(result), 200

@coding_bp.route('/submit', methods=['POST'])
@token_required
def submit_test(user_id):
    data = request.json
    role = data.get('role')
    language = data.get('language')
    code = data.get('code')
    output = data.get('output', "")
    execution_time = data.get('execution_time', 0.0)
    memory = data.get('memory', "8 MB")
    
    # AI Evaluation
    evaluation = CodingService.evaluate_with_ai(role, language, code, output)
    
    submission = {
        "user_id": user_id,
        "role": role,
        "language": language,
        "code": code,
        "output": output,
        "execution_time": execution_time,
        "memory": memory,
        "result": evaluation.get('pass_fail', 'FAIL'),
        "score": evaluation.get('overall_score', 0),
        "feedback": evaluation,
        "date": datetime.datetime.utcnow()
    }
    
    res = submissions_col.insert_one(submission)
    submission['_id'] = str(res.inserted_id)
    # Convert dates for JSON
    submission['date'] = submission['date'].isoformat()
    
    return jsonify({
        "success": True,
        "report": submission
    }), 201
