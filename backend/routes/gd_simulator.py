import os
import json
import datetime
from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth_helper import token_required
from bson.objectid import ObjectId
from services.ai_service import generate_ai_response, generate_chat_completion

gd_bp = Blueprint('gd_simulator', __name__)
db = get_db()
gd_sessions_col = db['gd_sessions']
users_col = db['users']

DEFAULT_TOPICS = [
    {
        "id": "gd_ai_jobs",
        "category": "Technology & AI",
        "title": "Will Generative AI Eliminate Junior Developer Jobs or Democratize Innovation?",
        "summary": "Discuss the impact of LLMs on tech hiring, developer velocity, entry-level roles, and the evolving skill requirements in 2026."
    },
    {
        "id": "gd_remote_work",
        "category": "Workplace & Policy",
        "title": "Remote Work vs. Hybrid Mandates: What Truly Drives Innovation and Culture?",
        "summary": "Analyze productivity metrics, collaboration overhead, employee mental health, and company loyalty across workplace models."
    },
    {
        "id": "gd_moonlighting",
        "category": "Business Ethics",
        "title": "Moonlighting & Side Hustles: An Inevitable Future or Breach of Trust?",
        "summary": "Debate dual-employment ethics, intellectual property risk, employee autonomy, and rising gig economy dynamics."
    },
    {
        "id": "gd_data_privacy",
        "category": "Ethics & Governance",
        "title": "Data Sovereignty vs Global AI Acceleration: Can Regulations Keep Up?",
        "summary": "Explore AI safety laws, data monopolies, user privacy, and national competitiveness in frontier technologies."
    },
    {
        "id": "gd_electric_vehicles",
        "category": "Sustainability & Economy",
        "title": "The EV Revolution in Emerging Economies: Infrastructure Hype vs Reality",
        "summary": "Discuss charging infrastructure, battery recycling, power grid readiness, and consumer affordability."
    }
]

AI_PARTICIPANTS = [
    {
        "id": "aarav",
        "name": "Aarav Sharma",
        "avatar": "👨‍💻",
        "role": "Tech Enthusiast",
        "style": "Fast-paced, data-driven, assertive, brings up recent industry trends",
        "color": "cyan"
    },
    {
        "id": "priya",
        "name": "Priya Nair",
        "avatar": "👩‍💼",
        "role": "Strategic Analyst",
        "style": "Structured, diplomatic, focuses on business impact and sustainability",
        "color": "purple"
    },
    {
        "id": "rohan",
        "name": "Rohan Verma",
        "avatar": "👨‍🔬",
        "role": "Critical Skeptic",
        "style": "Questioning, highlights edge cases, counterarguments, and ethical risks",
        "color": "amber"
    },
    {
        "id": "sneha",
        "name": "Sneha Patel",
        "avatar": "👩‍🎓",
        "role": "User Advocate",
        "style": "Empathetic, focuses on human factor, societal implications, and accessibility",
        "color": "emerald"
    }
]


def _clean_json(raw_text):
    if not raw_text:
        return None
    try:
        if "```json" in raw_text:
            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_text:
            raw_text = raw_text.split("```")[1].split("```")[0].strip()
        start = raw_text.find('{')
        end = raw_text.rfind('}')
        if start != -1 and end != -1:
            return json.loads(raw_text[start:end+1])
        return json.loads(raw_text.strip())
    except Exception as e:
        print(f"GD JSON Parse error: {e}")
        return None


@gd_bp.route('/topics', methods=['GET'])
@token_required
def get_gd_topics(user_id):
    """Return available pre-configured and dynamic GD topics."""
    return jsonify({
        "topics": DEFAULT_TOPICS,
        "participants": AI_PARTICIPANTS
    }), 200


@gd_bp.route('/start', methods=['POST'])
@token_required
def start_gd_session(user_id):
    """Start a virtual GD session and generate opening speech by moderator & first participant."""
    data = request.get_json() or {}
    topic_title = data.get('topic_title', DEFAULT_TOPICS[0]['title'])
    duration_minutes = int(data.get('duration_minutes', 5))

    # Fetch candidate name
    cand_name = "Candidate"
    try:
        u = users_col.find_one({"_id": ObjectId(user_id)})
        if u:
            cand_name = u.get("name", "Candidate")
    except Exception:
        pass

    session_id = str(ObjectId())

    prompt = f"""
    You are moderating a competitive campus placement Group Discussion round.
    GD Topic: "{topic_title}"
    Participants in room:
    - Moderator: Dr. K. Raman (Session Chair)
    - Candidate: {cand_name}
    - Aarav Sharma (Tech Enthusiast - fast-paced, optimistic, data & tech innovation view)
    - Priya Nair (Strategic Analyst - structured, ROI & business execution view)
    - Rohan Verma (Critical Skeptic - counter-intuitive, risks, security, pitfalls view)
    - Sneha Patel (User Advocate - human empathy, workforce ethics, societal impact view)

    Task:
    1. Moderator: Brief 2-sentence opening stating the topic and inviting participants.
    2. ALL FOUR participants (Aarav, Priya, Rohan, and Sneha) MUST each give a distinct, articulate 2-sentence opening opinion on "{topic_title}".
    - Aarav Sharma: Focuses on exponential technology, developer leverage, and innovation speed.
    - Priya Nair: Focuses on operational strategy, enterprise scalability, and commercial viability.
    - Rohan Verma: Questions assumptions, points out hidden risks, governance vulnerabilities, or unintended consequences.
    - Sneha Patel: Highlights user empathy, junior developer career paths, mental well-being, or societal inclusivity.

    Output JSON ONLY:
    {{
        "moderator_opening": "Good day participants. Welcome to this Group Discussion on '{topic_title}'. Please present your perspectives clearly and maintain active listening.",
        "opening_stances": [
            {{
                "speaker_id": "aarav",
                "speaker_name": "Aarav Sharma",
                "role": "Tech Enthusiast",
                "avatar": "👨‍💻",
                "color": "cyan",
                "text": "Looking at current data and developer trends, I believe this is an incredible catalyst rather than a threat..."
            }},
            {{
                "speaker_id": "priya",
                "speaker_name": "Priya Nair",
                "role": "Strategic Analyst",
                "avatar": "👩‍💼",
                "color": "purple",
                "text": "While the technological upside is evident, from an enterprise perspective, we must examine the cost structure and long-term organizational value..."
            }},
            {{
                "speaker_id": "rohan",
                "speaker_name": "Rohan Verma",
                "role": "Critical Skeptic",
                "avatar": "👨‍🔬",
                "color": "amber",
                "text": "I'd like to urge caution before overestimating these benefits. History shows that rapid transitions often create massive blind spots in quality and accountability..."
            }},
            {{
                "speaker_id": "sneha",
                "speaker_name": "Sneha Patel",
                "role": "User Advocate",
                "avatar": "👩‍🎓",
                "color": "emerald",
                "text": "Building on what's been said, we cannot lose sight of the human dimension—how this directly impacts junior talent onboarding and equitable access..."
            }}
        ]
    }}
    """

    raw = generate_ai_response(prompt)
    parsed = _clean_json(raw) or {}

    moderator_text = parsed.get("moderator_opening") or f"Good day participants. Welcome to this Group Discussion on '{topic_title}'. Let us begin by hearing each participant's opening perspective. The floor is open."
    
    opening_stances = parsed.get("opening_stances") or [
        {
            "speaker_id": "aarav",
            "speaker_name": "Aarav Sharma",
            "role": "Tech Enthusiast",
            "avatar": "👨‍💻",
            "color": "cyan",
            "text": f"Looking at current industry dynamics around '{topic_title}', technological acceleration is inevitable and those who adapt early will dominate productivity gains."
        },
        {
            "speaker_id": "priya",
            "speaker_name": "Priya Nair",
            "role": "Strategic Analyst",
            "avatar": "👩‍💼",
            "color": "purple",
            "text": f"From a strategic viewpoint, while technology drives efficiency, organizations need clear policy frameworks and measurable KPIs to make '{topic_title}' viable."
        },
        {
            "speaker_id": "rohan",
            "speaker_name": "Rohan Verma",
            "role": "Critical Skeptic",
            "avatar": "👨‍🔬",
            "color": "amber",
            "text": f"I must challenge some of that optimism. When we analyze '{topic_title}', there are significant operational risks and edge cases that are currently being overlooked."
        },
        {
            "speaker_id": "sneha",
            "speaker_name": "Sneha Patel",
            "role": "User Advocate",
            "avatar": "👩‍🎓",
            "color": "emerald",
            "text": f"Adding to the discussion, we have to consider the human and societal angle. Any transition surrounding '{topic_title}' must ensure inclusivity and long-term equity."
        }
    ]

    initial_turns = [
        {
            "sender_id": "moderator",
            "sender_name": "Dr. K. Raman (Moderator)",
            "avatar": "🎓",
            "role": "Moderator",
            "text": moderator_text,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "type": "moderator"
        }
    ]

    for stance in opening_stances:
        initial_turns.append({
            "sender_id": stance.get("speaker_id"),
            "sender_name": stance.get("speaker_name"),
            "avatar": stance.get("avatar", "👤"),
            "role": stance.get("role", "Participant"),
            "color": stance.get("color", "cyan"),
            "text": stance.get("text"),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "type": "ai_participant"
        })

    gd_sessions_col.insert_one({
        "_id": ObjectId(session_id),
        "user_id": user_id,
        "topic": topic_title,
        "duration_minutes": duration_minutes,
        "turns": initial_turns,
        "status": "active",
        "started_at": datetime.datetime.utcnow()
    })

    return jsonify({
        "session_id": session_id,
        "topic": topic_title,
        "participants": AI_PARTICIPANTS,
        "initial_turns": initial_turns
    }), 200



@gd_bp.route('/turn', methods=['POST'])
@token_required
def process_gd_turn(user_id):
    """
    Candidate sends their response/interjection.
    The AI generates 1 or 2 dynamic peer responses building on, challenging, or summarizing the candidate's points.
    """
    data = request.get_json() or {}
    session_id = data.get('session_id')
    user_speech = data.get('speech', '').strip()
    topic = data.get('topic', '')

    if not session_id or not user_speech:
        return jsonify({"error": "Missing speech or session_id"}), 400

    # Fetch candidate name
    cand_name = "Candidate"
    try:
        u = users_col.find_one({"_id": ObjectId(user_id)})
        if u:
            cand_name = u.get("name", "Candidate")
    except Exception:
        pass

    # Retrieve current turns history
    sess = gd_sessions_col.find_one({"_id": ObjectId(session_id)})
    recent_turns = sess.get("turns", [])[-6:] if sess else []

    dialogue_context = "\n".join([
        f"{t.get('sender_name')}: {t.get('text')}" for t in recent_turns
    ])

    prompt = f"""
    You are simulating a live virtual campus Group Discussion round on topic: "{topic}".
    The candidate just spoke:
    {cand_name}: "{user_speech}"

    Recent discussion context:
    {dialogue_context}

    Task:
    Select the NEXT 1 or 2 AI participants to respond naturally.
    Available AI participants:
    - Priya Nair (id: priya) - Strategic Analyst (seeks consensus, looks at metrics & business)
    - Rohan Verma (id: rohan) - Critical Skeptic (challenges assumptions, raises edge cases)
    - Sneha Patel (id: sneha) - User Advocate (brings human factor, social aspects)
    - Aarav Sharma (id: aarav) - Tech Enthusiast (brings tech analogies)

    Rules:
    1. Participants should directly acknowledge or debate {cand_name}'s statement (e.g. "I agree with {cand_name}, however...", "Adding to what {cand_name} highlighted...").
    2. Keep each response concise (2-3 punchy sentences).
    3. Output pure JSON with array of 'responses'.

    Output JSON ONLY:
    {{
        "responses": [
            {{
                "speaker_id": "priya",
                "speaker_name": "Priya Nair",
                "avatar": "👩‍💼",
                "role": "Strategic Analyst",
                "text": "I really appreciate {cand_name}'s point about... However, looking at the ROI...",
                "agreement_type": "partial_agreement"
            }}
        ]
    }}
    """

    raw = generate_ai_response(prompt)
    parsed = _clean_json(raw) or {
        "responses": [
            {
                "speaker_id": "priya",
                "speaker_name": "Priya Nair",
                "avatar": "👩‍💼",
                "role": "Strategic Analyst",
                "text": f"That's a very pragmatic observation from {cand_name}. To supplement that, we should also look at how organizations balance efficiency with long-term retention.",
                "agreement_type": "agreement"
            }
        ]
    }

    user_turn = {
        "sender_id": "user",
        "sender_name": cand_name,
        "avatar": "🧑‍💻",
        "role": "You (Candidate)",
        "text": user_speech,
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "type": "candidate"
    }

    new_ai_turns = []
    for r in parsed.get("responses", []):
        new_ai_turns.append({
            "sender_id": r.get("speaker_id"),
            "sender_name": r.get("speaker_name"),
            "avatar": r.get("avatar", "🗣️"),
            "role": r.get("role", "Participant"),
            "text": r.get("text"),
            "agreement_type": r.get("agreement_type", "neutral"),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "type": "ai_participant"
        })

    # Save to session
    gd_sessions_col.update_one(
        {"_id": ObjectId(session_id)},
        {"$push": {"turns": {"$each": [user_turn] + new_ai_turns}}}
    )

    return jsonify({
        "candidate_turn": user_turn,
        "ai_responses": new_ai_turns
    }), 200


@gd_bp.route('/evaluate', methods=['POST'])
@token_required
def evaluate_gd_session(user_id):
    """
    Conclude GD session and provide AI scoring across:
    1. Content & Articulation (0-10)
    2. Leadership & Initiation (0-10)
    3. Listening & Group Dynamics (0-10)
    4. Assertiveness & Decorum (0-10)
    5. Overall Placement Clearance Verdict
    """
    data = request.get_json() or {}
    session_id = data.get('session_id')

    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400

    sess = gd_sessions_col.find_one({"_id": ObjectId(session_id)})
    if not sess:
        return jsonify({"error": "Session not found"}), 404

    all_turns = sess.get("turns", [])
    cand_turns = [t for t in all_turns if t.get("type") == "candidate"]

    if not cand_turns:
        return jsonify({
            "overall_score": 0.0,
            "verdict": "Needs Participation",
            "feedback": "No participation recorded during the GD session.",
            "metrics": {"content": 0, "leadership": 0, "listening": 0, "assertiveness": 0}
        }), 200

    dialogue_summary = "\n".join([
        f"{t.get('sender_name')}: {t.get('text')}" for t in all_turns
    ])

    prompt = f"""
    You are an expert HR evaluation panel rating a candidate's Group Discussion performance.
    Topic: "{sess.get('topic')}"

    Full GD Transcript:
    {dialogue_summary}

    Candidate Contributions:
    {json.dumps([t['text'] for t in cand_turns])}

    Evaluate the candidate on a scale of 0 to 10 for:
    1. content_depth: Structured logic, domain examples, and relevant points.
    2. leadership_initiative: Timely entry, guiding discussion, opening or summarizing.
    3. active_listening: Acknowledging others, building on ideas, avoid rude interruptions.
    4. articulation_decorum: Professional vocabulary, clarity, tone, and poise.
    5. overall_score: Weighted composite (0 to 10).

    Also provide:
    - verdict: "Clear Shortlist ✅", "Borderline ⚠️", or "Needs Training ❌"
    - top_strengths: Array of 3 bullet points
    - key_improvements: Array of 3 actionable coaching tips
    - summary: 2-3 sentence executive recap.

    Output JSON ONLY:
    {{
        "content_depth": 8.5,
        "leadership_initiative": 8.0,
        "active_listening": 9.0,
        "articulation_decorum": 8.5,
        "overall_score": 8.5,
        "verdict": "Clear Shortlist ✅",
        "top_strengths": ["...", "...", "..."],
        "key_improvements": ["...", "...", "..."],
        "summary": "..."
    }}
    """

    raw = generate_ai_response(prompt)
    parsed = _clean_json(raw) or {
        "content_depth": 7.5,
        "leadership_initiative": 7.0,
        "active_listening": 8.0,
        "articulation_decorum": 8.0,
        "overall_score": 7.6,
        "verdict": "Clear Shortlist ✅",
        "top_strengths": [
            "Maintained respectful tone when presenting counter-arguments",
            "Directly addressed peer points before introducing new perspectives",
            "Clear logical progression in spoken points"
        ],
        "key_improvements": [
            "Attempt to synthesize or summarize the group's consensus towards the end",
            "Bring in more quantitative industry statistics to reinforce arguments",
            "Be slightly more proactive during silent transition periods"
        ],
        "summary": "Solid overall GD participation with good listening skills and coherent arguments."
    }

    gd_sessions_col.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"evaluation": parsed, "status": "completed", "completed_at": datetime.datetime.utcnow()}}
    )

    return jsonify({
        "session_id": session_id,
        "topic": sess.get("topic"),
        "evaluation": parsed,
        "turns_count": len(cand_turns)
    }), 200
