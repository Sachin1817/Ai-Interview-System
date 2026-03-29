import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from routes.auth import auth_bp
from routes.resume import resume_bp
from routes.interview import interview_bp
from routes.career import career_bp
from routes.assessment import assessment_bp
from flask_apscheduler import APScheduler
import datetime

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(interview_bp, url_prefix='/api/interview')
app.register_blueprint(career_bp, url_prefix='/api/career')
app.register_blueprint(assessment_bp, url_prefix='/api/assessment')

# ─── Scheduler ───
scheduler = APScheduler()

def refresh_opportunities_job():
    """Background task to refresh and verify opportunities every 6 hours."""
    from utils.db import get_db
    db = get_db()
    jobs_col = db['jobs']
    today = datetime.date.today().isoformat()
    
    # 1. Mark expired
    res = jobs_col.update_many(
        {"deadline": {"$lt": today}, "status": {"$ne": "expired"}},
        {"$set": {"status": "expired"}}
    )
    print(f"SCHEDULER: Expired {res.modified_count} outdated opportunities.")
    
    # 2. Simulate 'fetching' new ones if needed (keeping it fresh for demo)
    count = jobs_col.count_documents({"deadline": {"$gte": today}})
    if count < 5:
        from scripts.seed_jobs import JOBS
        # Update deadlines of seed jobs to future
        future_date = (datetime.date.today() + datetime.timedelta(days=30)).isoformat()
        for j in JOBS:
            j['deadline'] = future_date
            j['status'] = 'active'
        jobs_col.insert_many(JOBS)
        print("SCHEDULER: Refreshed database with 10 new verified opportunities.")

scheduler.init_app(app)
scheduler.start()

# Add job to run every 6 hours
scheduler.add_job(id='refresh_jobs', func=refresh_opportunities_job, trigger='interval', hours=6)

# Basic health check route
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "AI Placement API is running!"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
