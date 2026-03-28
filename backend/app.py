import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.interview import interview_bp
from routes.career import career_bp
from routes.assessment import assessment_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(interview_bp, url_prefix='/api/interview')
app.register_blueprint(career_bp, url_prefix='/api/career')
app.register_blueprint(assessment_bp, url_prefix='/api/assessment')

# Basic health check route
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "AI Placement API is running!"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
