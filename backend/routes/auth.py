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
    
    # sachindevaraju49@gmail.com is exclusively the HR admin
    if email and email.lower() == 'sachindevaraju49@gmail.com':
        role = 'hr'
    else:
        role = data.get('role', 'candidate')

    if not email or not name:
        return jsonify({"message": "Missing required fields (email/name)"}), 400

    # Ensure we have EITHER a password OR a Firebase UID
    if not password and not firebase_uid:
        return jsonify({"message": "Missing authentication identifier (password or firebaseUid)"}), 400

    existing_user = users_col.find_one({"email": email})
    if existing_user:
        # If user exists, just return success if it's a Firebase sync
        if firebase_uid:
             user_role = existing_user.get('role', 'candidate')
             if email.lower() == 'sachindevaraju49@gmail.com' and user_role != 'hr':
                 users_col.update_one({"_id": existing_user["_id"]}, {"$set": {"role": "hr"}})
                 user_role = 'hr'
             token = generate_token(existing_user['_id'])
             return jsonify({
                "token": token, 
                "user": {
                    "id": str(existing_user['_id']), 
                    "name": existing_user['name'], 
                    "email": existing_user['email'], 
                    "branch": existing_user.get('branch', 'CSE'),
                    "role": user_role,
                    "firebaseUid": firebase_uid
                },
                "status": "synced"
             }), 200
        return jsonify({"message": "User already exists"}), 400

    user_data = {
        "email": email,
        "name": name,
        "branch": branch,
        "role": role,
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
            "role": role,
            "firebaseUid": firebase_uid
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_col.find_one({"email": email})
    if user and 'password' in user and verify_password(user['password'], password):
        user_role = user.get('role', 'candidate')
        if email.lower() == 'sachindevaraju49@gmail.com' and user_role != 'hr':
            users_col.update_one({"_id": user["_id"]}, {"$set": {"role": "hr"}})
            user_role = 'hr'
        token = generate_token(user['_id'])
        return jsonify({
            "token": token, 
            "user": {
                "id": str(user['_id']), 
                "name": user['name'], 
                "email": user['email'], 
                "branch": user.get('branch', 'CSE'),
                "role": user_role
            }
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401

from utils.auth_helper import token_required
@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Sync profile updates (e.g., branch) from frontend to MongoDB."""
    if user_id == "guest_user":
        return jsonify({"message": "Unauthorized: login required"}), 401
    data = request.get_json()
    update_data = {}
    
    for key in ['branch', 'name', 'phone', 'college', 'graduationYear', 'targetRole']:
        if key in data:
            update_data[key] = data[key]
            
    if 'cgpa' in data and data['cgpa'] is not None and str(data['cgpa']).strip() != "":
        try:
            update_data['cgpa'] = float(str(data['cgpa']).replace('%', '').strip())
        except (ValueError, TypeError):
            pass
        
    if update_data:
        try:
            # Try ObjectId first
            result = users_col.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
            if result.matched_count == 0:
                # Fallback to string user_id
                users_col.update_one({"_id": user_id}, {"$set": update_data})
        except Exception:
            # Fallback for invalid ObjectId format
            users_col.update_one({"_id": user_id}, {"$set": update_data})
            
    return jsonify({"message": "Profile synced successfully"}), 200

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    """Retrieve user profile details including CGPA from MongoDB."""
    if user_id == "guest_user":
        return jsonify({"message": "Unauthorized: login required"}), 401
    
    user = None
    try:
        user = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
        
    if not user:
        user = users_col.find_one({"_id": user_id})
        
    if not user:
        return jsonify({"message": "User not found"}), 404
        
    return jsonify({
        "id": str(user['_id']),
        "name": user.get('name', ''),
        "email": user.get('email', ''),
        "phone": user.get('phone', ''),
        "branch": user.get('branch', ''),
        "college": user.get('college', ''),
        "graduationYear": user.get('graduationYear', ''),
        "targetRole": user.get('targetRole', ''),
        "cgpa": user.get('cgpa', None)
    }), 200
