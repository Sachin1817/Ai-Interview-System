from flask import Blueprint, request, jsonify
from services.resume_service import extract_text_from_pdf, analyze_resume
from utils.auth_helper import token_required
from utils.db import get_db
import os
from werkzeug.utils import secure_filename

resume_bp = Blueprint('resume', __name__)
db = get_db()
resumes_col = db['resumes']

UPLOAD_FOLDER = 'uploads/resumes'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@resume_bp.route('/upload', methods=['POST'])
@token_required
def upload_resume(user_id):
    if 'file' not in request.files:
        return jsonify({"message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, f"{user_id}_{filename}")
    file.save(file_path)

    text = extract_text_from_pdf(file_path)
    diagnosis = analyze_resume(text)

    # Save to DB
    resumes_col.update_one(
        {"user_id": user_id},
        {"$set": {
            "file_path": file_path,
            "text": text,
            "diagnosis": diagnosis,
            "updated_at": os.path.getmtime(file_path)
        }},
        upsert=True
    )

    return jsonify({"message": "Resume uploaded and analyzed", "diagnosis": diagnosis}), 200

@resume_bp.route('/diagnosis', methods=['GET'])
@token_required
def get_diagnosis(user_id):
    resume = resumes_col.find_one({"user_id": user_id})
    if not resume:
        return jsonify({"message": "No resume found"}), 404
        
    return jsonify(resume['diagnosis']), 200
