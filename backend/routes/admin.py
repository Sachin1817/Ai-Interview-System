from flask import Blueprint, request, jsonify, send_file
from utils.db import get_db
from utils.auth_helper import token_required
from bson.objectid import ObjectId
import datetime
import os

admin_bp = Blueprint('admin', __name__)
db = get_db()
users_col = db['users']
resumes_col = db['resumes']
jobs_col = db['jobs']
interviews_col = db['interviews']
answers_col = db['answers']
submissions_col = db['coding_submissions']
scores_col = db['scores']
applications_col = db['applications']

def check_hr(user_id):
    user = None
    try:
        user = users_col.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = users_col.find_one({"_id": user_id})
    return user and user.get("role") == "hr"


@admin_bp.route('/analytics', methods=['GET'])
@token_required
def get_hr_analytics(user_id):
    """HR Analytics Dashboard — hiring funnel, branch distribution, weekly trend, top jobs."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    period = request.args.get('period', '30')  # days
    try:
        days = int(period)
    except ValueError:
        days = 30
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)

    # ── Hiring Funnel ──
    all_apps = list(applications_col.find({"applied_at": {"$gte": cutoff}}))
    funnel = {
        "applied": len(all_apps),
        "shortlisted": sum(1 for a in all_apps if a.get("status") == "shortlisted"),
        "interview_scheduled": sum(1 for a in all_apps if a.get("status") == "interview_scheduled"),
        "hired": sum(1 for a in all_apps if a.get("status") == "hired"),
        "rejected": sum(1 for a in all_apps if a.get("status") == "rejected"),
    }

    # ── Branch Distribution of Candidates ──
    branch_pipeline = [
        {"$match": {"role": {"$ne": "hr"}}},
        {"$group": {"_id": "$branch", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 8}
    ]
    branch_dist = [{"branch": b.get("_id") or "Unknown", "count": b["count"]}
                   for b in users_col.aggregate(branch_pipeline)]

    # ── Weekly Application Trend (last 7 weeks) ──
    weekly_trend = []
    for w in range(6, -1, -1):
        week_start = datetime.datetime.utcnow() - datetime.timedelta(weeks=w+1)
        week_end = datetime.datetime.utcnow() - datetime.timedelta(weeks=w)
        count = applications_col.count_documents({"applied_at": {"$gte": week_start, "$lt": week_end}})
        label = f"W{7-w}"
        weekly_trend.append({"label": label, "count": count})

    # ── Top Jobs by Application Count ──
    job_pipeline = [
        {"$group": {"_id": "$job_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_jobs_raw = list(applications_col.aggregate(job_pipeline))
    top_jobs = []
    for tj in top_jobs_raw:
        jid = tj["_id"]
        job = None
        try:
            job = jobs_col.find_one({"_id": ObjectId(str(jid))}, {"title": 1, "company": 1})
        except Exception:
            job = jobs_col.find_one({"_id": jid}, {"title": 1, "company": 1})
        top_jobs.append({
            "title": job.get("title", "Unknown") if job else "Unknown",
            "company": job.get("company", "") if job else "",
            "count": tj["count"]
        })

    # ── Average Interview Score per Branch ──
    score_pipeline = [
        {"$group": {"_id": "$branch", "avg": {"$avg": "$overall_score"}, "count": {"$sum": 1}}},
        {"$sort": {"avg": -1}},
        {"$limit": 6}
    ]
    branch_scores = [
        {"branch": b.get("_id") or "General", "avg": round(b["avg"], 1), "count": b["count"]}
        for b in scores_col.aggregate(score_pipeline)
    ]

    # ── Overall KPIs ──
    total_candidates = users_col.count_documents({"role": {"$ne": "hr"}})
    active_jobs = jobs_col.count_documents({"status": {"$ne": "closed"}})
    avg_ats = 0
    ats_res = list(resumes_col.find({"diagnosis.score": {"$exists": True}}, {"diagnosis.score": 1}))
    if ats_res:
        avg_ats = round(sum(r["diagnosis"]["score"] for r in ats_res) / len(ats_res), 1)

    return jsonify({
        "funnel": funnel,
        "branch_dist": branch_dist,
        "weekly_trend": weekly_trend,
        "top_jobs": top_jobs,
        "branch_scores": branch_scores,
        "kpis": {
            "total_candidates": total_candidates,
            "active_jobs": active_jobs,
            "total_applications": funnel["applied"],
            "placements": funnel["hired"],
            "avg_ats_score": avg_ats,
        }
    }), 200


@admin_bp.route('/candidates', methods=['GET'])
@token_required
def get_candidates(user_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403

    query_str = request.args.get('query', '').strip()
    
    # Fetch all candidates
    candidates = list(users_col.find({"role": {"$ne": "hr"}}))
    
    results = []
    for cand in candidates:
        cand_id_str = str(cand['_id'])
        name = cand.get('name', '')
        email = cand.get('email', '')
        
        # Exclude test/tester/mock users dynamically
        if any(x in name.lower() or x in email.lower() for x in ['test', 'tester', 'mock']):
            continue
            
        # Find resume for this candidate
        resume = resumes_col.find_one({"user_id": cand_id_str})
        
        # Determine if they match the query_str
        keywords = []
        ats_score = 0
        skills = []
        if resume:
            keywords = resume.get('keywords', [])
            diagnosis = resume.get('diagnosis', {})
            ats_score = diagnosis.get('score', 0)
            skills = diagnosis.get('skills', [])
            
        # Match check
        if query_str:
            q_lower = query_str.lower()
            name_match = q_lower in cand.get('name', '').lower()
            email_match = q_lower in cand.get('email', '').lower()
            skill_match = any(q_lower in k.lower() for k in keywords) or any(q_lower in s.lower() for s in skills)
            if not (name_match or email_match or skill_match):
                continue
                
        results.append({
            "id": cand_id_str,
            "name": cand.get('name', ''),
            "email": cand.get('email', ''),
            "branch": cand.get('branch', 'CSE'),
            "ats_score": ats_score,
            "skills": skills,
            "keywords": keywords,
            "has_resume": resume is not None
        })
        
    return jsonify(results), 200

@admin_bp.route('/resume/<candidate_id>/download', methods=['GET'])
@token_required
def download_candidate_resume(user_id, candidate_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    resume = resumes_col.find_one({"user_id": candidate_id})
    if not resume or not resume.get('file_path'):
        return jsonify({"message": "Resume file not found for candidate"}), 404
        
    file_path = resume['file_path'].replace('\\', '/')
    actual_path = None
    
    paths_to_check = [
        file_path,
        os.path.join('..', file_path),
        os.path.join('backend', file_path),
        os.path.abspath(file_path)
    ]
    
    for path in paths_to_check:
        if os.path.exists(path):
            actual_path = path
            break
            
    if not actual_path:
        return jsonify({"message": "Resume PDF file is missing on the server disk. (Database record exists but file was not found)"}), 404
        
    return send_file(actual_path, mimetype='application/pdf')

@admin_bp.route('/jobs', methods=['POST'])
@token_required
def create_job(user_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    data = request.get_json()
    title = data.get('title')
    company = data.get('company', 'Our Company')
    location = data.get('location', 'India')
    description = data.get('description', '')
    skills = data.get('skills', [])
    job_type = data.get('jobType', 'Full-time')
    deadline = data.get('deadline', (datetime.date.today() + datetime.timedelta(days=30)).isoformat())
    
    # New cutoff metrics
    try:
        cgpa_cutoff = float(data.get('cgpaCutoff', 0.0))
    except (ValueError, TypeError):
        cgpa_cutoff = 0.0
        
    try:
        vacancies = int(data.get('vacancies', 1))
    except (ValueError, TypeError):
        vacancies = 1

    if not title or not skills:
        return jsonify({"message": "Missing required fields (title/skills)"}), 400

    new_job = {
        "title": title,
        "company": company,
        "location": location,
        "description": description,
        "skills": [s.strip() for s in skills],
        "jobType": job_type,
        "deadline": deadline,
        "cgpaCutoff": cgpa_cutoff,
        "vacancies": vacancies,
        "is_hr_posted": True,
        "created_by": user_id,
        "status": "active"
    }
    
    res = jobs_col.insert_one(new_job)
    new_job['_id'] = str(res.inserted_id)
    
    return jsonify(new_job), 201

@admin_bp.route('/jobs', methods=['GET'])
@token_required
def get_jobs(user_id):
    # If the user is HR, return all jobs (active and closed) for lifecycle management
    if check_hr(user_id):
        jobs = list(jobs_col.find({"is_hr_posted": True}))
    else:
        # If candidate, return only active openings
        jobs = list(jobs_col.find({"is_hr_posted": True, "status": "active"}))
        
    for j in jobs:
        j['_id'] = str(j['_id'])
    return jsonify(jobs), 200

@admin_bp.route('/jobs/<job_id>/close', methods=['POST', 'PUT'])
@token_required
def close_job(user_id, job_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    try:
        res = jobs_col.update_one({"_id": ObjectId(job_id)}, {"$set": {"status": "closed"}})
        if res.matched_count == 0:
            jobs_col.update_one({"_id": job_id}, {"$set": {"status": "closed"}})
    except Exception:
        jobs_col.update_one({"_id": job_id}, {"$set": {"status": "closed"}})
        
    return jsonify({"success": True, "message": "Job opening closed successfully!"}), 200

@admin_bp.route('/rank/<job_id>', methods=['GET'])
@token_required
def rank_candidates(user_id, job_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403

    job = None
    try:
        job = jobs_col.find_one({"_id": ObjectId(job_id)})
    except Exception:
        pass
    if not job:
        job = jobs_col.find_one({"_id": job_id})
        
    if not job:
        return jsonify({"message": "Job posting not found"}), 404
        
    required_skills = [s.lower().strip() for s in job.get('skills', []) if s]
    
    # Fetch all candidates who applied to this job
    try:
        job_oid = ObjectId(job_id)
        applications = list(db['applications'].find({"job_id": {"$in": [job_id, job_oid]}}))
    except Exception:
        applications = list(db['applications'].find({"job_id": job_id}))
        
    applied_user_ids = set()
    for app in applications:
        uid = app.get('user_id')
        if uid:
            applied_user_ids.add(str(uid))
            
    # Fetch candidate details
    candidates = list(users_col.find({"role": {"$ne": "hr"}}))
    candidates = [c for c in candidates if str(c['_id']) in applied_user_ids]
    ranked_list = []
    
    for cand in candidates:
        cand_id_str = str(cand['_id'])
        resume = resumes_col.find_one({"user_id": cand_id_str})
        
        cand_skills = []
        ats_score = 0
        if resume:
            diagnosis = resume.get('diagnosis', {})
            ats_score = diagnosis.get('score', 0)
            cand_skills = [s.lower().strip() for s in resume.get('keywords', [])]
            if not cand_skills:
                cand_skills = [s.lower().strip() for s in diagnosis.get('skills', [])]
                
        # Calculate intersection
        matched = []
        missing = []
        for req in required_skills:
            is_matched = False
            for cand_skill in cand_skills:
                if req in cand_skill or cand_skill in req:
                    is_matched = True
                    matched.append(req)
                    break
            if not is_matched:
                missing.append(req)
                
        if required_skills:
            match_percentage = int((len(matched) / len(required_skills)) * 100)
        else:
            match_percentage = 0
            
        ranked_list.append({
            "candidate_id": cand_id_str,
            "name": cand.get('name', ''),
            "email": cand.get('email', ''),
            "branch": cand.get('branch', 'CSE'),
            "ats_score": ats_score,
            "match_percentage": match_percentage,
            "matched_skills": matched,
            "missing_skills": missing,
            "has_resume": resume is not None
        })
        
    ranked_list.sort(key=lambda x: (x['match_percentage'], x['ats_score']), reverse=True)
    
    return jsonify({
        "job_title": job.get('title'),
        "company": job.get('company'),
        "required_skills": job.get('skills', []),
        "rankings": ranked_list
    }), 200

@admin_bp.route('/assign-interview', methods=['POST'])
@token_required
def assign_interview(user_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    data = request.get_json()
    candidate_id = data.get('candidate_id')
    interview_type = data.get('interview_type')
    role = data.get('role', 'Software Engineer')
    difficulty = data.get('difficulty', 'Intermediate')
    
    if not candidate_id or not interview_type:
        return jsonify({"message": "Missing required fields (candidate_id/interview_type)"}), 400

    session_id = str(ObjectId())
    
    session_doc = {
        "_id": ObjectId(session_id),
        "user_id": candidate_id,
        "role": role,
        "difficulty": difficulty,
        "is_manual_mode": True,
        "interview_type": interview_type,
        "status": "assigned",
        "assigned_by": user_id,
        "created_at": datetime.datetime.utcnow()
    }
    
    if interview_type == 'standard':
        manual_questions = data.get('manual_questions', [])
        if not manual_questions:
            return jsonify({"message": "Standard manual interview requires questions"}), 400
        
        formatted_questions = []
        for i, q in enumerate(manual_questions):
            formatted_questions.append({
                "id": f"mq_{i}",
                "question": q,
                "topic": "Manual Technical"
            })
        session_doc["questions"] = formatted_questions
        session_doc["manual_questions"] = manual_questions
    elif interview_type == 'coding':
        coding_challenge = data.get('coding_challenge')
        if not coding_challenge or not coding_challenge.get('title'):
            return jsonify({"message": "Coding interview requires a challenge definition"}), 400
        
        challenge_doc = {
            "title": coding_challenge.get('title'),
            "description": coding_challenge.get('description', ''),
            "language": coding_challenge.get('language', 'python').lower(),
            "boilerplate": coding_challenge.get('boilerplate', ''),
            "input_output": coding_challenge.get('input_output', ''),
            "difficulty": difficulty
        }
        session_doc["coding_challenge"] = challenge_doc
        
    interviews_col.insert_one(session_doc)
    session_doc['_id'] = session_id
    session_doc['created_at'] = session_doc['created_at'].isoformat()
    
    return jsonify({
        "success": True,
        "message": f"Successfully assigned {interview_type} manual interview session.",
        "session": session_doc
    }), 201

@admin_bp.route('/submissions', methods=['GET'])
@token_required
def get_submissions(user_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    completed_interviews = list(interviews_col.find({"status": "completed", "user_id": {"$ne": "guest_user"}}))
    for x in completed_interviews:
        x['_id'] = str(x['_id'])
        cand = None
        u_id = x.get('user_id')
        if u_id:
            try:
                cand = users_col.find_one({"_id": ObjectId(u_id)})
            except Exception:
                cand = users_col.find_one({"_id": u_id})
        x['candidate_name'] = cand.get('name', 'Unknown') if cand else 'Unknown'
        x['candidate_email'] = cand.get('email', '') if cand else ''

    coding_submits = list(submissions_col.find({"user_id": {"$ne": "guest_user"}}).sort("date", -1))
    for s in coding_submits:
        s['_id'] = str(s['_id'])
        if isinstance(s.get('date'), datetime.datetime):
            s['date'] = s['date'].isoformat()
        cand = None
        u_id = s.get('user_id')
        if u_id:
            try:
                cand = users_col.find_one({"_id": ObjectId(u_id)})
            except Exception:
                cand = users_col.find_one({"_id": u_id})
        s['candidate_name'] = cand.get('name', 'Unknown') if cand else 'Unknown'
        s['candidate_email'] = cand.get('email', '') if cand else ''

    return jsonify({
        "interviews": completed_interviews,
        "coding_submissions": coding_submits
    }), 200

@admin_bp.route('/apply', methods=['POST'])
@token_required
def apply_job(user_id):
    if user_id == "guest_user":
        return jsonify({"message": "Unauthorized: login required to apply for jobs"}), 401
        
    data = request.get_json()
    job_id = data.get('job_id')
    if not job_id:
        return jsonify({"message": "Missing job_id"}), 400
        
    db['applications'].update_one(
        {"user_id": user_id, "job_id": job_id},
        {"$set": {
            "applied_at": datetime.datetime.utcnow(),
            "status": "applied"
        }},
        upsert=True
    )
    return jsonify({"success": True, "message": "Application submitted successfully!"}), 200

@admin_bp.route('/applied-jobs', methods=['GET'])
@token_required
def get_applied_jobs(user_id):
    if user_id == "guest_user":
        return jsonify([]), 200
        
    apps = list(db['applications'].find({"user_id": user_id}))
    for a in apps:
        a['_id'] = str(a['_id'])
        if 'applied_at' in a and isinstance(a['applied_at'], datetime.datetime):
            a['applied_at'] = a['applied_at'].isoformat()
    return jsonify(apps), 200

@admin_bp.route('/applications', methods=['GET'])
@token_required
def get_all_applications(user_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    apps = list(db['applications'].find())
    results = []
    for a in apps:
        a_id = str(a['_id'])
        cand_id = a.get('user_id')
        job_id = a.get('job_id')
        
        # Get candidate details
        cand = None
        if cand_id:
            try:
                cand = users_col.find_one({"_id": ObjectId(cand_id)})
            except Exception:
                cand = users_col.find_one({"_id": cand_id})
            
        # Get job details
        job = None
        if job_id:
            try:
                job = jobs_col.find_one({"_id": ObjectId(job_id)})
            except Exception:
                job = jobs_col.find_one({"_id": job_id})
            
        # Get resume score
        ats_score = 0
        if cand_id:
            resume = resumes_col.find_one({"user_id": str(cand_id)})
            if resume:
                ats_score = resume.get('diagnosis', {}).get('score', 0)
                
        results.append({
            "_id": a_id,
            "candidate_name": cand.get('name', 'Unknown') if cand else 'Unknown',
            "candidate_email": cand.get('email', '') if cand else '',
            "job_title": job.get('title', 'Unknown Job') if job else 'Unknown Job',
            "company": job.get('company', 'Our Company') if job else 'Our Company',
            "applied_at": a.get('applied_at').isoformat() if isinstance(a.get('applied_at'), datetime.datetime) else str(a.get('applied_at', '')),
            "status": a.get('status', 'applied'),
            "ats_score": ats_score,
            "user_id": str(cand_id),
            "job_id": str(job_id)
        })
        
    return jsonify(results), 200

@admin_bp.route('/applications/<app_id>/status', methods=['PUT'])
@token_required
def update_application_status(user_id, app_id):
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden: HR access required"}), 403
        
    data = request.get_json()
    status = data.get('status')
    if not status:
        return jsonify({"message": "Missing status"}), 400
        
    try:
        db['applications'].update_one({"_id": ObjectId(app_id)}, {"$set": {"status": status}})
    except Exception:
        db['applications'].update_one({"_id": app_id}, {"$set": {"status": status}})
        
    # Retrieve application document details to trigger candidate notification
    try:
        app_doc = db['applications'].find_one({"_id": ObjectId(app_id)})
    except Exception:
        app_doc = db['applications'].find_one({"_id": app_id})

    if app_doc:
        cand_id = app_doc.get('user_id')
        job_id = app_doc.get('job_id')
        
        # Retrieve candidate details from users collection
        cand = None
        if cand_id:
            try:
                cand = users_col.find_one({"_id": ObjectId(cand_id)})
            except Exception:
                cand = users_col.find_one({"_id": cand_id})

        # Retrieve job specs details
        job = None
        if job_id:
            try:
                job = jobs_col.find_one({"_id": ObjectId(job_id)})
            except Exception:
                job = jobs_col.find_one({"_id": job_id})
                
        if cand and cand.get('email'):
            candidate_email = cand.get('email')
            candidate_name = cand.get('name', 'Candidate')
            job_title = job.get('title', 'Unknown Job') if job else 'Unknown Job'
            company = job.get('company', 'Our Company') if job else 'Our Company'

            # ── In-app notification ──
            try:
                from routes.notifications import insert_notification
                status_messages = {
                    'shortlisted': f"🎉 Congrats! You've been shortlisted for {job_title} at {company}.",
                    'rejected': f"Your application for {job_title} at {company} was not selected this time. Keep going!",
                    'interview_scheduled': f"📅 Your interview for {job_title} at {company} has been scheduled. Check your email for details.",
                    'hired': f"🏆 Amazing! You've been hired for {job_title} at {company}. Congratulations!",
                    'applied': f"✅ Your application for {job_title} at {company} has been received.",
                }
                notif_type = 'success' if status in ('shortlisted', 'hired') else 'warning' if status == 'rejected' else 'info'
                message = status_messages.get(status, f"Your application status for {job_title} at {company} was updated to: {status}.")
                insert_notification(str(cand_id), message, notif_type, {"job_id": str(job_id), "status": status})
            except Exception as notif_err:
                print(f"[Notifications] Failed to insert notification: {notif_err}")

            try:
                from utils.email_helper import send_status_email
                send_status_email(candidate_email, candidate_name, job_title, company, status)
            except Exception as email_err:
                print(f"Error executing send_status_email helper: {email_err}")
        
    return jsonify({"success": True, "message": "Application status updated successfully!"}), 200


# ─── BULK ACTIONS & SCHEDULING ───

@admin_bp.route('/applications/bulk-status', methods=['POST'])
@token_required
def bulk_update_status(user_id):
    """Update status for multiple applications at once with notifications & email."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    app_ids = data.get('application_ids', [])
    new_status = data.get('status')

    if not app_ids or not new_status:
        return jsonify({"message": "Missing application_ids or status"}), 400

    updated_count = 0
    from routes.notifications import insert_notification
    from utils.email_helper import send_status_email

    for app_id in app_ids:
        try:
            oid = ObjectId(app_id)
            app_doc = applications_col.find_one({"_id": oid})
            applications_col.update_one({"_id": oid}, {"$set": {"status": new_status}})
        except Exception:
            app_doc = applications_col.find_one({"_id": app_id})
            applications_col.update_one({"_id": app_id}, {"$set": {"status": new_status}})

        if app_doc:
            updated_count += 1
            cand_id = app_doc.get('user_id')
            job_id = app_doc.get('job_id')

            cand = None
            try:
                cand = users_col.find_one({"_id": ObjectId(cand_id)})
            except Exception:
                cand = users_col.find_one({"_id": cand_id})

            job = None
            try:
                job = jobs_col.find_one({"_id": ObjectId(job_id)})
            except Exception:
                job = jobs_col.find_one({"_id": job_id})

            if cand and cand.get('email'):
                job_title = job.get('title', 'Position') if job else 'Position'
                company = job.get('company', 'Our Company') if job else 'Our Company'

                try:
                    notif_type = 'success' if new_status in ('shortlisted', 'hired') else 'warning' if new_status == 'rejected' else 'info'
                    msg = f"Your application for {job_title} at {company} has been updated to: {new_status}."
                    insert_notification(str(cand_id), msg, notif_type, {"job_id": str(job_id), "status": new_status})
                except Exception:
                    pass

                try:
                    send_status_email(cand.get('email'), cand.get('name', 'Candidate'), job_title, company, new_status)
                except Exception:
                    pass

    return jsonify({
        "success": True,
        "updated_count": updated_count,
        "message": f"Successfully updated {updated_count} applications to '{new_status}'."
    }), 200


@admin_bp.route('/candidates/bulk-assign', methods=['POST'])
@token_required
def bulk_assign_interviews(user_id):
    """Assign custom interview tracks to multiple candidates simultaneously."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    cand_ids = data.get('candidate_ids', [])
    interview_type = data.get('interview_type', 'standard')
    role = data.get('role', 'Software Engineer')
    custom_questions = data.get('questions', [])
    coding_challenge = data.get('coding_challenge', {})

    if not cand_ids:
        return jsonify({"message": "No candidates selected"}), 400

    assigned_count = 0
    for cid in cand_ids:
        new_inv = {
            "assigned_by": user_id,
            "candidate_id": cid,
            "interview_type": interview_type,
            "target_role": role,
            "status": "pending",
            "assigned_at": datetime.datetime.utcnow().isoformat(),
            "completed": False
        }
        if interview_type == 'standard':
            new_inv["custom_questions"] = custom_questions
        else:
            new_inv["coding_challenge"] = coding_challenge

        db['assigned_interviews'].insert_one(new_inv)
        assigned_count += 1

        # Notify candidate
        try:
            from routes.notifications import insert_notification
            insert_notification(
                cid,
                f"📋 A custom {interview_type.capitalize()} interview track for '{role}' has been assigned to you by HR.",
                "info",
                {"type": interview_type, "role": role}
            )
        except Exception:
            pass

    return jsonify({
        "success": True,
        "assigned_count": assigned_count,
        "message": f"Successfully assigned {interview_type} interview track to {assigned_count} candidates."
    }), 200


# ─── CSV / DATA EXPORTS ───

@admin_bp.route('/export/candidates', methods=['GET'])
@token_required
def export_candidates_csv(user_id):
    """Generate and return a CSV export of all candidates with resumes and scores."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    import csv
    import io
    from flask import Response

    all_cands = list(users_col.find({"role": {"$ne": "hr"}}))

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Candidate Name", "Email", "Branch", "Phone", "ATS Score", "Key Skills", "Resume Uploaded"])

    for c in all_cands:
        cid = str(c['_id'])
        resume = resumes_col.find_one({"user_id": cid})
        ats = resume.get('diagnosis', {}).get('score', 'N/A') if resume else 'N/A'
        skills = ", ".join(resume.get('extracted_skills', [])[:5]) if resume else 'N/A'
        has_res = "Yes" if resume else "No"

        writer.writerow([
            c.get("name", "Unknown"),
            c.get("email", ""),
            c.get("branch", "CSE"),
            c.get("phone", "N/A"),
            ats,
            skills,
            has_res
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=candidates_directory_export.csv"}
    )


@admin_bp.route('/export/applications', methods=['GET'])
@token_required
def export_applications_csv(user_id):
    """Generate and return a CSV export of all applications."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    import csv
    import io
    from flask import Response

    all_apps = list(applications_col.find())

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Candidate Name", "Candidate Email", "Job Title", "Company", "Status", "Applied Date"])

    for a in all_apps:
        cid = a.get("user_id")
        jid = a.get("job_id")

        cand = None
        try:
            cand = users_col.find_one({"_id": ObjectId(cid)})
        except Exception:
            cand = users_col.find_one({"_id": cid})

        job = None
        try:
            job = jobs_col.find_one({"_id": ObjectId(jid)})
        except Exception:
            job = jobs_col.find_one({"_id": jid})

        applied_dt = a.get("applied_at")
        applied_str = applied_dt.strftime("%Y-%m-%d %H:%M") if hasattr(applied_dt, "strftime") else str(applied_dt or "")

        writer.writerow([
            cand.get("name", "Unknown") if cand else "Unknown",
            cand.get("email", "") if cand else "",
            job.get("title", "Unknown") if job else "Unknown",
            job.get("company", "") if job else "",
            a.get("status", "applied"),
            applied_str
        ])

    output.seek(0)
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=applications_pipeline_export.csv"}
    )


@admin_bp.route('/bulk-email', methods=['POST'])
@token_required
def send_bulk_email_route(user_id):
    """Send custom bulk emails to selected candidates with subject, body, and in-app notifications."""
    if not check_hr(user_id):
        return jsonify({"message": "Forbidden"}), 403

    data = request.get_json() or {}
    candidate_ids = data.get('candidate_ids', [])
    subject = data.get('subject', '').strip()
    body = data.get('body', '').strip()

    if not candidate_ids or not subject or not body:
        return jsonify({"message": "Missing recipient candidate_ids, subject, or email body"}), 400

    from utils.email_helper import send_custom_email
    from routes.notifications import insert_notification

    dispatched_count = 0
    for cid in candidate_ids:
        cand = None
        try:
            cand = users_col.find_one({"_id": ObjectId(cid)})
        except Exception:
            cand = users_col.find_one({"_id": cid})

        if cand and cand.get('email'):
            cand_email = cand.get('email')
            cand_name = cand.get('name', 'Candidate')

            # Personalize placeholders if present
            personalized_body = body.replace('{name}', cand_name).replace('{email}', cand_email)
            personalized_subject = subject.replace('{name}', cand_name)

            # Send email
            send_custom_email(cand_email, cand_name, personalized_subject, personalized_body)
            dispatched_count += 1

            # Dispatch in-app notification with full subject and message body
            try:
                full_notif_text = f"✉️ {personalized_subject}\n\n{personalized_body}"
                insert_notification(
                    str(cid),
                    full_notif_text,
                    "info",
                    {"type": "hr_broadcast", "subject": personalized_subject, "body": personalized_body}
                )
            except Exception:
                pass


    return jsonify({
        "success": True,
        "dispatched_count": dispatched_count,
        "message": f"Successfully sent bulk email to {dispatched_count} candidate(s)."
    }), 200



