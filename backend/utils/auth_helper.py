import jwt
import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from flask import request, jsonify
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super-secret-jwt-key")

def hash_password(password):
    return generate_password_hash(password)

def verify_password(hashed_password, password):
    return check_password_hash(hashed_password, password)

def generate_token(user_id):
    payload = {
        'user_id': str(user_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")
            if len(parts) == 2:
                token = parts[1]
        
        current_user_id = "guest_user"
        if token and token != "null" and token != "undefined":
            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
                current_user_id = data['user_id']
            except:
                pass
            
        return f(current_user_id, *args, **kwargs)
    
    return decorated
