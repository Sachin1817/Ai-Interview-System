import os
import datetime
from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth_helper import token_required
from bson.objectid import ObjectId
import groq

# LiveKit token generation imports
import importlib
try:
    _livekit_api = importlib.import_module('livekit.api')
    AccessToken = getattr(_livekit_api, 'AccessToken', None)
    VideoGrants = getattr(_livekit_api, 'VideoGrants', None)
    LIVEKIT_AVAILABLE = bool(AccessToken and VideoGrants)
except Exception:
    AccessToken = None
    VideoGrants = None
    LIVEKIT_AVAILABLE = False

ai_interview_bp = Blueprint('ai_interview', __name__)
db = get_db()
sessions_col = db['ai_interview_sessions']
turns_col = db['ai_interview_turns']
summaries_col = db['ai_interview_summaries']
notes_col = db['ai_interview_notes']
users_col = db['users']
jobs_col = db['jobs']

def get_groq_client():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        return None
    return groq.Groq(api_key=api_key)

# ─── 1. Session Management ───

@ai_interview_bp.route('/sessions', methods=['POST'])
@token_required
def create_session(user_id):
    """Create a new AI interview session and issue a LiveKit WebRTC access token."""
    data = request.get_json() or {}
    job_id = data.get('job_id')
    role_context = data.get('role_context', 'Software Engineer')
    difficulty = data.get('difficulty', 'Intermediate')
    recording_type = data.get('recording_type', 'video')

    # Fetch user details
    cand_name = "Candidate"
    cand_email = ""
    if user_id != "guest_user":
        cand = None
        try:
            cand = users_col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            cand = users_col.find_one({"_id": user_id})
        if cand:
            cand_name = cand.get('name', 'Candidate')
            cand_email = cand.get('email', '')

    session_id = str(ObjectId())
    room_name = f"ai_interview_{session_id[:8]}"

    # Generate LiveKit Token
    lk_url = os.environ.get('AI_INTERVIEW_LIVEKIT_URL', '')
    lk_key = os.environ.get('AI_INTERVIEW_LIVEKIT_API_KEY', '')
    lk_secret = os.environ.get('AI_INTERVIEW_LIVEKIT_API_SECRET', '')
    
    token_str = ""
    if lk_key and lk_secret and LIVEKIT_AVAILABLE:
        try:
            token = AccessToken(lk_key, lk_secret) \
                .with_identity(user_id) \
                .with_name(cand_name) \
                .with_grants(VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True
                ))
            token_str = token.to_jwt()
        except Exception as e:
            print(f"Error generating LiveKit token: {e}")

    new_session = {
        "_id": ObjectId(session_id),
        "user_id": user_id,
        "candidate_name": cand_name,
        "candidate_email": cand_email,
        "job_id": job_id,
        "role_context": role_context,
        "difficulty": difficulty,
        "status": "scheduled",
        "started_at": datetime.datetime.utcnow().isoformat(),
        "completed_at": None,
        "recording_url": None,
        "recording_type": recording_type,
        "duration_seconds": 0,
        "permissions_denied": False,
        "livekit_room_name": room_name,
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    sessions_col.insert_one(new_session)

    return jsonify({
        "success": True,
        "session_id": session_id,
        "livekit_token": token_str,
        "livekit_url": lk_url,
        "room_name": room_name,
        "session": {
            "id": session_id,
            "role_context": role_context,
            "difficulty": difficulty,
            "candidate_name": cand_name,
            "status": "scheduled"
        }
    }), 201


@ai_interview_bp.route('/sessions/<session_id>', methods=['GET'])
@token_required
def get_session(user_id, session_id):
    """Get session details by ID."""
    session = None
    try:
        session = sessions_col.find_one({"_id": ObjectId(session_id)})
    except Exception:
        session = sessions_col.find_one({"_id": session_id})

    if not session:
        return jsonify({"message": "Session not found"}), 404

    session['_id'] = str(session['_id'])
    return jsonify(session), 200


@ai_interview_bp.route('/sessions/<session_id>/status', methods=['PUT'])
@token_required
def update_session_status(user_id, session_id):
    """Update session status (in_progress, completed, abandoned)."""
    data = request.get_json() or {}
    status = data.get('status')
    duration_seconds = data.get('duration_seconds')
    recording_url = data.get('recording_url')
    permissions_denied = data.get('permissions_denied')

    update_fields = {}
    if status:
        update_fields['status'] = status
        if status == 'completed':
            update_fields['completed_at'] = datetime.datetime.utcnow().isoformat()
    if duration_seconds is not None:
        update_fields['duration_seconds'] = duration_seconds
    if recording_url is not None:
        update_fields['recording_url'] = recording_url
    if permissions_denied is not None:
        update_fields['permissions_denied'] = permissions_denied

    try:
        sessions_col.update_one({"_id": ObjectId(session_id)}, {"$set": update_fields})
    except Exception:
        sessions_col.update_one({"_id": session_id}, {"$set": update_fields})

    return jsonify({"success": True, "message": f"Session status updated to {status}"}), 200


# ─── 2. Turn & Adaptive Conversational Engine ───

@ai_interview_bp.route('/sessions/<session_id>/turns', methods=['POST'])
@token_required
def record_turn(user_id, session_id):
    """Save an interview dialogue turn (AI or Candidate)."""
    data = request.get_json() or {}
    speaker = data.get('speaker')  # 'ai' or 'candidate'
    text = data.get('text', '').strip()
    timestamp_ms = data.get('timestamp_ms', 0)

    if not speaker or not text:
        return jsonify({"message": "Missing speaker or text"}), 400

    turn_doc = {
        "session_id": session_id,
        "speaker": speaker,
        "text": text,
        "timestamp_ms": timestamp_ms,
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    res = turns_col.insert_one(turn_doc)
    turn_doc['_id'] = str(res.inserted_id)

    return jsonify({"success": True, "turn": turn_doc}), 201


@ai_interview_bp.route('/sessions/<session_id>/turns', methods=['GET'])
@token_required
def get_turns(user_id, session_id):
    """Get all conversation turns for an interview session."""
    turns = list(turns_col.find({"session_id": session_id}).sort("timestamp_ms", 1))
    for t in turns:
        t['_id'] = str(t['_id'])
        txt = t.get('text', '')
        stop_tokens = ["[INTENDED ANSWER:]", "[INTERVIEWEE:]", "[INTERVIEWER:]", "[QUESTION:]", "Candidate:", "Interviewer:"]
        for st in stop_tokens:
            if st in txt:
                txt = txt.split(st)[0].strip()
        t['text'] = txt
    return jsonify(turns), 200



@ai_interview_bp.route('/sessions/<session_id>/interact', methods=['POST'])
@token_required
def interact_ai(user_id, session_id):
    """
    Adaptive AI Interview Engine:
    Receives candidate utterance (or empty string for initial question),
    sends history to Groq Llama 3.3-70b, returns AI response, and auto-saves turns.
    """
    data = request.get_json() or {}
    user_utterance = data.get('utterance', '').strip()
    timestamp_ms = data.get('timestamp_ms', 0)

    session = None
    try:
        session = sessions_col.find_one({"_id": ObjectId(session_id)})
    except Exception:
        session = sessions_col.find_one({"_id": session_id})

    if not session:
        return jsonify({"message": "Session not found"}), 404

    role_context = session.get('role_context', 'Software Engineer')
    difficulty = session.get('difficulty', 'Intermediate')

    # Save user utterance turn if provided
    if user_utterance:
        turns_col.insert_one({
            "session_id": session_id,
            "speaker": "candidate",
            "text": user_utterance,
            "timestamp_ms": timestamp_ms,
            "created_at": datetime.datetime.utcnow().isoformat()
        })

    # Fetch conversation history
    past_turns = list(turns_col.find({"session_id": session_id}).sort("timestamp_ms", 1))
    turn_count = len([t for t in past_turns if t.get('speaker') == 'ai'])

    # Build prompt for Groq
    groq_client = get_groq_client()
    if not groq_client:
        ai_text = f"Welcome to your {role_context} interview! Tell me about your background and key projects."
    else:
        system_prompt = (
            f"You are an expert, conversational Senior Engineering Hiring Lead conducting a real-time voice interview for a candidate applying for a {role_context} position ({difficulty} level).\n\n"
            f"STRICT 2-SENTENCE INTERVIEW STRUCTURE:\n"
            f"1. Sentence 1: Reply and comment directly on what the candidate just said (e.g., acknowledge their project, technical concept, stack choice, or hesitation).\n"
            f"2. Sentence 2: Ask a focused, organic technical follow-up question digging deeper into the architecture, challenges, trade-offs, or implementation details of what they mentioned.\n\n"
            f"HANDLING SPECIAL CASES:\n"
            f"- If the candidate gives a filler or acknowledgment (e.g., 'ok', 'yes', 'sure', 'give me a second'): Do NOT repeat the previous question; briefly say: 'Take your time, whenever you are ready!' and invite them to continue.\n"
            f"- If the candidate asks a question or asks to repeat: Answer it directly in 1 short sentence, then ask your question.\n"
            f"- Keep the entire response strictly 2 short spoken sentences so the conversation is snappy and realistic.\n"
            f"- When turn count is 6 or more, provide brief positive feedback and ask a concluding wrap-up question followed by '[WRAP_UP]'."
        )

        messages = [{"role": "system", "content": system_prompt}]
        for t in past_turns:
            role = "assistant" if t.get('speaker') == 'ai' else "user"
            messages.append({"role": role, "content": t.get('text', '')})

        # Ensure the last message always has 'user' role for Groq API compliance
        if len(messages) == 1 or messages[-1]["role"] != "user":
            messages.append({"role": "user", "content": "I am ready to proceed with the interview."})

        # Models ordered by speed and quality (llama-3.1-8b-instant is sub-second)
        models_to_try = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3.8-27b"]
        ai_text = None

        for current_model in models_to_try:
            try:
                response = groq_client.chat.completions.create(
                    model=current_model,
                    messages=messages,
                    temperature=0.5,
                    max_tokens=90,
                    stop=["[INTERVIEWEE:]", "[QUESTION:]", "Candidate:", "Interviewer:"]
                )
                ai_text = response.choices[0].message.content.strip()
                if ai_text:
                    break
            except Exception as e:
                print(f"Groq interact error with model {current_model}: {e}")

        if not ai_text:
            if len(past_turns) == 0:
                ai_text = f"Welcome! Could you share your technical background and key projects you have worked on?"
            else:
                ai_text = f"Thank you for explaining that. Could you dive deeper into the key architecture choices and challenges you encountered?"

    import re
    if ai_text:
        # Strip any reasoning tags if returned by reasoning models
        ai_text = re.sub(r'<think>.*?</think>', '', ai_text, flags=re.DOTALL).strip()

    is_wrap_up = "[WRAP_UP]" in ai_text
    clean_ai_text = ai_text.replace("[WRAP_UP]", "").strip()
    stop_tokens = ["[INTENDED ANSWER:]", "[INTERVIEWEE:]", "[INTERVIEWER:]", "[QUESTION:]", "Candidate:", "Interviewer:"]
    for st in stop_tokens:
        if st in clean_ai_text:
            clean_ai_text = clean_ai_text.split(st)[0].strip()



    # Save AI turn
    ai_timestamp = timestamp_ms + 1000
    res_turn = turns_col.insert_one({
        "session_id": session_id,
        "speaker": "ai",
        "text": clean_ai_text,
        "timestamp_ms": ai_timestamp,
        "created_at": datetime.datetime.utcnow().isoformat()
    })

    return jsonify({
        "success": True,
        "ai_text": clean_ai_text,
        "is_wrap_up": is_wrap_up,
        "turn_count": turn_count + 1,
        "turn_id": str(res_turn.inserted_id)
    }), 200


# ─── 3. Async Summarization Pipeline ───

@ai_interview_bp.route('/sessions/<session_id>/summary', methods=['POST'])
@token_required
def generate_summary(user_id, session_id):
    """
    Generates AI fit summary, signal bucket, per-question scores, and highlight clips from transcript.
    """
    turns = list(turns_col.find({"session_id": session_id}).sort("timestamp_ms", 1))

    session = None
    try:
        session = sessions_col.find_one({"_id": ObjectId(session_id)})
    except Exception:
        session = sessions_col.find_one({"_id": session_id})

    role_context = session.get('role_context', 'Software Engineer') if session else 'Software Engineer'

    if not turns:
        summary_doc = {
            "session_id": session_id,
            "summary_text": "Interview session ended before any dialogue was recorded.",
            "signal_bucket": "weak",
            "per_question_scores": [],
            "highlight_clips": [],
            "flags": ["No audio dialogue recorded"],
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        summaries_col.update_one({"session_id": session_id}, {"$set": summary_doc}, upsert=True)
        return jsonify({"success": True, "summary": summary_doc}), 200

    # Format transcript text
    transcript_text = "\n".join([f"{t.get('speaker').upper()}: {t.get('text')}" for t in turns])

    groq_client = get_groq_client()
    summary_text = "Candidate demonstrated solid communication and technical background during the interview."
    signal_bucket = "worth_a_look"
    per_question_scores = []
    highlight_clips = []
    flags = []

    if groq_client:
        prompt = (
            f"Analyze this AI technical interview transcript for a {role_context} position.\n\n"
            f"TRANSCRIPT:\n{transcript_text}\n\n"
            f"Provide a structured JSON output with the exact format:\n"
            f"{{\n"
            f'  "summary_text": "2-3 sentence overall candidate assessment.",\n'
            f'  "signal_bucket": "strong" | "worth_a_look" | "weak",\n'
            f'  "per_question_scores": [\n'
            f'     {{"question": "...", "answer": "...", "score": 8, "feedback": "..."}}\n'
            f"  ],\n"
            f'  "highlight_clips": [\n'
            f'     {{"topic": "...", "timestamp_ms": 12000, "note": "..."}}\n'
            f"  ],\n"
            f'  "flags": ["any yellow or red flags"]\n'
            f"}}\n"
            f"Return ONLY valid JSON."
        )
        
        models_to_try = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.1-8b-instant"]
        for current_model in models_to_try:
            try:
                res = groq_client.chat.completions.create(
                    model=current_model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                import json
                parsed = json.loads(res.choices[0].message.content)
                summary_text = parsed.get("summary_text", summary_text)
                signal_bucket = parsed.get("signal_bucket", signal_bucket)
                per_question_scores = parsed.get("per_question_scores", per_question_scores)
                highlight_clips = parsed.get("highlight_clips", highlight_clips)
                flags = parsed.get("flags", flags)
                break
            except Exception as e:
                print(f"Error generating Groq summary with model {current_model}: {e}")


    summary_doc = {
        "session_id": session_id,
        "summary_text": summary_text,
        "signal_bucket": signal_bucket,
        "per_question_scores": per_question_scores,
        "highlight_clips": highlight_clips,
        "flags": flags,
        "turns_count": len(turns),
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    summaries_col.update_one({"session_id": session_id}, {"$set": summary_doc}, upsert=True)

    # Mark session completed if not already
    try:
        sessions_col.update_one({"_id": ObjectId(session_id)}, {"$set": {"status": "completed"}})
    except Exception:
        sessions_col.update_one({"_id": session_id}, {"$set": {"status": "completed"}})

    return jsonify({"success": True, "summary": summary_doc}), 200


@ai_interview_bp.route('/sessions/<session_id>/summary', methods=['GET'])
@token_required
def get_summary(user_id, session_id):
    """Retrieve summary for session."""
    summary = summaries_col.find_one({"session_id": session_id})
    if not summary:
        return jsonify({"message": "Summary not found"}), 404
    summary['_id'] = str(summary['_id'])
    return jsonify(summary), 200


# ─── 4. Recruiter Notes & HR Dashboard API ───

@ai_interview_bp.route('/sessions/<session_id>/notes', methods=['POST'])
@token_required
def add_note(user_id, session_id):
    """Add a recruiter note to an interview session."""
    data = request.get_json() or {}
    note_text = data.get('note_text', '').strip()
    if not note_text:
        return jsonify({"message": "Note text is required"}), 400

    note_doc = {
        "session_id": session_id,
        "author_id": user_id,
        "note_text": note_text,
        "created_at": datetime.datetime.utcnow().isoformat()
    }

    res = notes_col.insert_one(note_doc)
    note_doc['_id'] = str(res.inserted_id)

    return jsonify({"success": True, "note": note_doc}), 201


@ai_interview_bp.route('/sessions/<session_id>/notes', methods=['GET'])
@token_required
def get_notes(user_id, session_id):
    """Get recruiter notes for session."""
    notes = list(notes_col.find({"session_id": session_id}).sort("created_at", -1))
    for n in notes:
        n['_id'] = str(n['_id'])
    return jsonify(notes), 200


@ai_interview_bp.route('/admin/sessions', methods=['GET'])
@token_required
def get_admin_sessions(user_id):
    """HR Dashboard endpoint: list candidate AI interviews with fit summaries and signal buckets."""
    all_sessions = list(sessions_col.find().sort("created_at", -1))
    results = []

    for sess in all_sessions:
        s_id = str(sess['_id'])
        cand_id = sess.get('user_id')
        
        # Get candidate name/email
        cand_name = sess.get('candidate_name', 'Unknown')
        cand_email = sess.get('candidate_email', '')
        if cand_id and cand_name == 'Unknown':
            try:
                u = users_col.find_one({"_id": ObjectId(cand_id)})
                if u:
                    cand_name = u.get('name', 'Unknown')
                    cand_email = u.get('email', '')
            except Exception:
                pass

        # Get summary if available
        summary_doc = summaries_col.find_one({"session_id": s_id})
        summary_text = summary_doc.get('summary_text', 'No summary generated yet.') if summary_doc else 'In progress / pending.'
        signal_bucket = summary_doc.get('signal_bucket', 'worth_a_look') if summary_doc else 'worth_a_look'

        results.append({
            "id": s_id,
            "user_id": str(cand_id),
            "candidate_name": cand_name,
            "candidate_email": cand_email,
            "role_context": sess.get('role_context', 'Software Engineer'),
            "difficulty": sess.get('difficulty', 'Intermediate'),
            "status": sess.get('status', 'scheduled'),
            "started_at": sess.get('started_at'),
            "completed_at": sess.get('completed_at'),
            "duration_seconds": sess.get('duration_seconds', 0),
            "recording_url": sess.get('recording_url'),
            "recording_type": sess.get('recording_type', 'video'),
            "summary_text": summary_text,
            "signal_bucket": signal_bucket,
            "permissions_denied": sess.get('permissions_denied', False)
        })

    return jsonify(results), 200
