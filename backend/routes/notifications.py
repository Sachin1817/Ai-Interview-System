from flask import Blueprint, request, jsonify
from utils.db import get_db
from utils.auth_helper import token_required
from bson.objectid import ObjectId
import datetime

notifications_bp = Blueprint('notifications', __name__)
db = get_db()
notifs_col = db['notifications']


def insert_notification(user_id: str, message: str, notif_type: str = 'info', meta: dict = None):
    """Helper — insert a notification for a candidate. Called from other routes."""
    notifs_col.insert_one({
        "user_id": user_id,
        "message": message,
        "type": notif_type,          # 'info' | 'success' | 'warning' | 'error'
        "meta": meta or {},
        "read": False,
        "created_at": datetime.datetime.utcnow(),
    })


@notifications_bp.route('/', methods=['GET'])
@token_required
def get_notifications(user_id):
    """Fetch all notifications for the logged-in candidate, newest first."""
    limit = int(request.args.get('limit', 30))
    notifs = list(
        notifs_col.find({"user_id": user_id})
        .sort("created_at", -1)
        .limit(limit)
    )
    for n in notifs:
        n['_id'] = str(n['_id'])
        if isinstance(n.get('created_at'), datetime.datetime):
            n['created_at'] = n['created_at'].isoformat() + "Z"
        elif isinstance(n.get('created_at'), str) and not n['created_at'].endswith('Z'):
            n['created_at'] = n['created_at'] + "Z"

    unread_count = notifs_col.count_documents({"user_id": user_id, "read": False})
    return jsonify({"notifications": notifs, "unread_count": unread_count}), 200



@notifications_bp.route('/<notif_id>/read', methods=['PUT'])
@token_required
def mark_read(user_id, notif_id):
    """Mark a single notification as read."""
    try:
        notifs_col.update_one(
            {"_id": ObjectId(notif_id), "user_id": user_id},
            {"$set": {"read": True}}
        )
    except Exception:
        pass
    return jsonify({"success": True}), 200


@notifications_bp.route('/read-all', methods=['PUT'])
@token_required
def mark_all_read(user_id):
    """Mark ALL notifications as read for this user."""
    notifs_col.update_many({"user_id": user_id, "read": False}, {"$set": {"read": True}})
    return jsonify({"success": True}), 200


@notifications_bp.route('/<notif_id>', methods=['DELETE'])
@token_required
def dismiss_notification(user_id, notif_id):
    """Delete a single notification."""
    try:
        notifs_col.delete_one({"_id": ObjectId(notif_id), "user_id": user_id})
    except Exception:
        pass
    return jsonify({"success": True}), 200
