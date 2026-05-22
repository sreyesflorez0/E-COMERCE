from flask import Flask, request, jsonify
from flask_cors import CORS
import structlog

from app.config import config
from app.database import init_db
from app.auth import token_required, admin_required
from app.rabbitmq import start_rabbitmq_consumer
from app import service
from app.models import build_notification

logger = structlog.get_logger()

app = Flask(__name__)
CORS(app)

@app.before_request
def log_request_info():
    logger.info("Request", method=request.method, path=request.path)

# Initialize subsystems
with app.app_context():
    try:
        init_db()
        start_rabbitmq_consumer()
    except Exception as e:
        logger.error("Failed to initialize application", error=str(e))

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "Up", "service": "notification-service"}), 200

@app.route("/notifications/me", methods=["GET"])
@token_required
def get_my_notifications(current_user):
    unread = request.args.get("unread", "false").lower() == "true"
    event_type = request.args.get("event_type")
    
    try:
        limit = int(request.args.get("limit", 20))
        offset = int(request.args.get("offset", 0))
    except ValueError:
        return jsonify({"error": "Invalid limit or offset parameter"}), 400
        
    notifications = service.get_user_notifications(
        user_id=current_user["user_id"],
        unread_only=unread,
        event_type=event_type,
        limit=limit,
        offset=offset
    )
    
    return jsonify(notifications), 200

@app.route("/notifications/<notification_id>", methods=["GET"])
@token_required
def get_notification(current_user, notification_id):
    notification = service.get_notification_by_id(notification_id)
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    # Check permissions
    if current_user["role"] != "ADMIN" and notification["user_id"] != current_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
        
    return jsonify(notification), 200

@app.route("/notifications/<notification_id>/read", methods=["PATCH"])
@token_required
def mark_as_read(current_user, notification_id):
    notification = service.get_notification_by_id(notification_id)
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    # Check permissions
    if current_user["role"] != "ADMIN" and notification["user_id"] != current_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
        
    success = service.mark_notification_as_read(notification_id)
    if success:
        return jsonify({"message": "Notification marked as read"}), 200
    else:
        return jsonify({"error": "Failed to update notification"}), 500

@app.route("/notifications/read-all", methods=["PATCH"])
@token_required
def mark_all_read(current_user):
    updated_count = service.mark_all_as_read(current_user["user_id"])
    return jsonify({"message": f"{updated_count} notifications marked as read"}), 200

@app.route("/notifications/<notification_id>", methods=["DELETE"])
@token_required
def delete_notification(current_user, notification_id):
    notification = service.get_notification_by_id(notification_id)
    
    if not notification:
        return jsonify({"error": "Notification not found"}), 404
        
    # Check permissions
    if current_user["role"] != "ADMIN" and notification["user_id"] != current_user["user_id"]:
        return jsonify({"error": "Forbidden"}), 403
        
    success = service.delete_notification(notification_id)
    if success:
        return jsonify({"message": "Notification deleted"}), 200
    else:
        return jsonify({"error": "Failed to delete notification"}), 500

@app.route("/notifications/test", methods=["POST"])
@admin_required
def test_notification(current_user):
    data = request.json
    if not data:
        return jsonify({"error": "Missing JSON body"}), 400
        
    user_id = data.get("user_id")
    event_type = data.get("event_type", "manual_test")
    message = data.get("message")
    
    if not user_id or not message:
        return jsonify({"error": "user_id and message are required"}), 400
        
    try:
        doc = build_notification(user_id, event_type, message)
        notification_id = service.create_notification(doc)
        return jsonify({"message": "Test notification created", "id": notification_id}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error("Failed to create test notification", error=str(e))
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT)
