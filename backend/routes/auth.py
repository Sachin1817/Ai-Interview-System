from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth_helper import hash_password, verify_password, generate_token
from bson.objectid import ObjectId

auth_bp = Blueprint('auth', __name__)
db = get_db()
users_col = db['users']

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    branch = data.get('branch', 'CSE')
    firebase_uid = data.get('firebaseUid')

    if not email or not name:
        return jsonify({"message": "Missing required fields (email/name)"}), 400

    # Ensure we have EITHER a password OR a Firebase UID
    if not password and not firebase_uid:
        return jsonify({"message": "Missing authentication identifier (password or firebaseUid)"}), 400

    if users_col.find_one({"email": email}):
        # If user exists, just return success if it's a Firebase sync
        if firebase_uid:
             return jsonify({"message": "User already exists", "status": "synced"}), 200
        return jsonify({"message": "User already exists"}), 400

    user_data = {
        "email": email,
        "name": name,
        "branch": branch,
        "created_at": ObjectId().generation_time
    }

    if firebase_uid:
        user_data["firebaseUid"] = firebase_uid
    
    if password:
        user_data["password"] = hash_password(password)

    user_id = users_col.insert_one(user_data).inserted_id

    token = generate_token(user_id)
    return jsonify({
        "token": token, 
        "user": {
            "id": str(user_id), 
            "name": name, 
            "email": email, 
            "branch": branch,
            "firebaseUid": firebase_uid
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_col.find_one({"email": email})
    if user and verify_password(user['password'], password):
        token = generate_token(user['_id'])
        return jsonify({
            "token": token, 
            "user": {
                "id": str(user['_id']), 
                "name": user['name'], 
                "email": user['email'], 
                "branch": user.get('branch', 'CSE')
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401
