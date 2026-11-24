import os
import uuid
import json
import logging
import time
from collections import defaultdict
from pathlib import Path
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sys

# Structured server-side logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aura.api")

sys.path.insert(0, str(Path(__file__).parent))

_env_path = Path(__file__).parent / ".env"
if _env_path.exists():
    with open(_env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

from chat_engine import process_message, get_welcome_message
from resume_analyzer import analyze_resume
from resume_builder import build_resume
from doc_corrector import correct_document
from interview_engine import start_interview_session, get_next_question, evaluate_answer


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "aura-ai-portfolio-secret-2025")
    # Strict upload limit: 3MB max to protect server resources
    app.config["MAX_CONTENT_LENGTH"] = 3 * 1024 * 1024

    # CORS Configuration
    # In production, ALLOWED_ORIGINS or FRONTEND_URL specifies the exact allowed domain(s)
    allowed_origins_env = os.environ.get("ALLOWED_ORIGINS") or os.environ.get("FRONTEND_URL")
    if allowed_origins_env:
        origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
        CORS(app, origins=origins, supports_credentials=True)
        logger.info(f"CORS restricted to configured origins: {origins}")
    else:
        dev_origins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://localhost:3000"
        ]
        CORS(app, origins=dev_origins, supports_credentials=True)
        logger.info("CORS initialized with standard local development origins.")

    # In-memory IP Rate Limiter
    # Note: Current deployment uses instance-local rate limiting.
    # A distributed Redis-backed limiter would be appropriate if the application is later scaled across multiple backend instances.
    _rate_limit_store = defaultdict(lambda: defaultdict(list))

    def check_rate_limit(action: str, max_requests: int = 30, window_seconds: int = 60) -> bool:
        forwarded = request.headers.get("X-Forwarded-For", "")
        ip = forwarded.split(",")[0].strip() if forwarded else (request.remote_addr or "unknown")
        now = time.time()
        requests_list = _rate_limit_store[action][ip]
        # Drop timestamps older than window
        valid_requests = [t for t in requests_list if now - t < window_seconds]
        _rate_limit_store[action][ip] = valid_requests
        if len(valid_requests) >= max_requests:
            logger.warning(f"Rate limit exceeded for IP {ip} on action '{action}' ({len(valid_requests)}/{max_requests})")
            return False
        valid_requests.append(now)
        return True

    # Ephemeral in-memory interview session store with auto-expiry
    interview_sessions = {}
    interview_timestamps = {}

    def prune_stale_interviews():
        now = time.time()
        stale_ids = [iid for iid, ts in interview_timestamps.items() if now - ts > 1800]  # 30 min expiry
        for iid in stale_ids:
            interview_sessions.pop(iid, None)
            interview_timestamps.pop(iid, None)

    # -------------------------------------------------------------------------
    # Health & System Endpoints
    # -------------------------------------------------------------------------
    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "service": "Aura AI Production API",
            "version": "2.5.0",
            "status": "operational",
            "architecture": "stateless_browser_storage"
        })

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "healthy",
            "version": "2.5.0",
            "timestamp": datetime.utcnow().isoformat()
        })

    # Compatibility stubs for legacy auth checks
    @app.route("/api/auth/me", methods=["GET"])
    def get_me():
        return jsonify({"user": None, "authenticated": False, "guest": True})

    @app.route("/api/auth/logout", methods=["POST"])
    def logout():
        return jsonify({"message": "Logged out successfully."})

    # -------------------------------------------------------------------------
    # Chat & Session Endpoints (Completely Stateless)
    # -------------------------------------------------------------------------
    @app.route("/api/session/new", methods=["POST"])
    def new_session():
        session_id = str(uuid.uuid4())
        welcome = get_welcome_message()
        return jsonify({
            "session_id": session_id,
            "message": welcome,
            "session": {
                "session_id": session_id,
                "title": "New Conversation",
                "name": None,
                "current_semester": 1,
                "career_goal": None,
                "known_languages": [],
                "weekly_study_hours": 10,
                "profiling_step": 0,
                "profiling_complete": False
            }
        })

    @app.route("/api/chat", methods=["POST"])
    def chat():
        # Rate limit: 30 requests per minute per IP
        if not check_rate_limit("chat", max_requests=30, window_seconds=60):
            return jsonify({
                "error": "Rate limit exceeded. Please wait a few seconds before sending another message."
            }), 429

        data = request.get_json() or {}
        user_text = (data.get("message") or "").strip()
        session_id = (data.get("session_id") or str(uuid.uuid4())).strip()
        chat_history = data.get("chat_history") or []
        session_data = data.get("session_data") or {}

        if not user_text:
            return jsonify({"error": "Message cannot be empty."}), 400

        # Protect against excessive payload length (max 2,000 characters)
        if len(user_text) > 2000:
            return jsonify({"error": "Message is too long (maximum 2,000 characters)."}), 400

        try:
            # Bound history to last 10 messages
            safe_history = []
            for msg in chat_history[-10:]:
                if isinstance(msg, dict) and "role" in msg and "content" in msg:
                    safe_history.append({
                        "role": "user" if msg["role"] == "user" else "assistant",
                        "content": str(msg["content"])[:1500]
                    })

            response_text, updated_session = process_message(user_text, session_data, safe_history)

            return jsonify({
                "session_id": session_id,
                "message": response_text,
                "session": updated_session,
                "timestamp": datetime.utcnow().isoformat()
            })
        except Exception as e:
            logger.error(f"Error generating chat response: {e}")
            return jsonify({
                "message": "⚠️ AI response could not be generated at this moment. Please retry in a few seconds.",
                "timestamp": datetime.utcnow().isoformat()
            }), 200

    # -------------------------------------------------------------------------
    # Resume Analyzer & Builder
    # -------------------------------------------------------------------------
    @app.route("/api/resume/analyze", methods=["POST"])
    def analyze_resume_route():
        # Rate limit: 5 resume analyses per minute per IP
        if not check_rate_limit("resume_upload", max_requests=5, window_seconds=60):
            return jsonify({"error": "Resume analysis rate limit reached. Please wait a minute before uploading again."}), 429

        try:
            if 'file' in request.files:
                file = request.files['file']
                if not file or file.filename == '':
                    return jsonify({"error": "No file selected."}), 400
                file_content = file.read()
                result = analyze_resume(file_content=file_content, filename=file.filename)
            elif request.is_json:
                data = request.get_json() or {}
                resume_text = (data.get("text") or "").strip()
                if not resume_text:
                    return jsonify({"error": "Resume text is empty."}), 400
                result = analyze_resume(resume_text=resume_text)
            else:
                return jsonify({"error": "Invalid request. Provide a file upload or JSON payload with 'text'."}), 400

            if "error" in result and result.get("score", 0) == 0:
                return jsonify(result), 422
            return jsonify(result)
        except Exception as e:
            logger.error(f"Resume analysis failure: {e}")
            return jsonify({"error": "Failed to analyze resume. Please verify the document and try again."}), 500

    @app.route("/api/resume/build", methods=["POST"])
    def build_resume_route():
        if not check_rate_limit("resume_build", max_requests=8, window_seconds=60):
            return jsonify({"error": "Resume generation rate limit reached. Please wait a moment."}), 429

        data = request.get_json() or {}
        if not data:
            return jsonify({"error": "No profile data provided."}), 400

        try:
            result = build_resume(data)
            return jsonify(result)
        except Exception as e:
            logger.error(f"Resume builder failure: {e}")
            return jsonify({"error": "Failed to generate resume. Please try again."}), 500

    # -------------------------------------------------------------------------
    # Document Corrector
    # -------------------------------------------------------------------------
    @app.route("/api/document/correct", methods=["POST"])
    def correct_document_route():
        if not check_rate_limit("doc_correct", max_requests=10, window_seconds=60):
            return jsonify({"error": "Document correction rate limit reached. Please wait a moment."}), 429

        correction_mode = "full"
        doc_type = "general"

        try:
            if 'file' in request.files:
                file = request.files['file']
                if file.filename == '':
                    return jsonify({"error": "No file selected."}), 400
                correction_mode = request.form.get('correction_mode', 'full')
                doc_type = request.form.get('doc_type', 'general')
                file_content = file.read()
                result = correct_document(file_content=file_content, filename=file.filename, correction_mode=correction_mode, doc_type=doc_type)
            elif request.is_json:
                data = request.get_json() or {}
                doc_text = (data.get("text") or "").strip()
                if not doc_text:
                    return jsonify({"error": "Document text is required."}), 400
                if len(doc_text) > 8000:
                    return jsonify({"error": "Document text exceeds maximum length (8,000 characters)."}), 400
                correction_mode = data.get('correction_mode', 'full')
                doc_type = data.get('doc_type', 'general')
                result = correct_document(doc_text=doc_text, correction_mode=correction_mode, doc_type=doc_type)
            else:
                return jsonify({"error": "Send JSON with 'text' field or upload a file."}), 400

            return jsonify(result)
        except Exception as e:
            logger.error(f"Document correction error: {e}")
            return jsonify({"error": "Failed to process document."}), 500

    # -------------------------------------------------------------------------
    # Mock Interview
    # -------------------------------------------------------------------------
    @app.route("/api/interview/start", methods=["POST"])
    def interview_start():
        if not check_rate_limit("interview_start", max_requests=10, window_seconds=60):
            return jsonify({"error": "Interview rate limit reached. Please wait a moment."}), 429

        prune_stale_interviews()
        data = request.get_json() or {}
        role = str(data.get("role", "Software Engineer"))[:60]
        level = str(data.get("level", "Fresher"))[:30]

        interview_id = str(uuid.uuid4())
        session = start_interview_session(role, level)
        interview_sessions[interview_id] = session
        interview_timestamps[interview_id] = time.time()
        result = get_next_question(session)

        return jsonify({
            "interview_id": interview_id,
            "role": role,
            "level": level,
            "total_questions": session["total_questions"],
            **result
        })

    @app.route("/api/interview/answer", methods=["POST"])
    def interview_answer():
        if not check_rate_limit("interview_answer", max_requests=25, window_seconds=60):
            return jsonify({"error": "Please wait a moment before submitting another answer."}), 429

        data = request.get_json() or {}
        interview_id = (data.get("interview_id") or "").strip()
        answer = (data.get("answer") or "").strip()

        if not interview_id or not answer:
            return jsonify({"error": "interview_id and answer are required."}), 400

        if interview_id not in interview_sessions:
            return jsonify({"error": "Interview session expired or not found. Please start a new interview."}), 404

        try:
            session = interview_sessions[interview_id]
            result = evaluate_answer(session, answer)
            interview_timestamps[interview_id] = time.time()

            if result.get("completed"):
                interview_sessions.pop(interview_id, None)
                interview_timestamps.pop(interview_id, None)
                return jsonify(result)

            next_q = get_next_question(session)
            return jsonify({**result, **next_q})
        except Exception as e:
            logger.error(f"Interview evaluation error: {e}")
            return jsonify({"error": "Failed to evaluate answer. Please try again."}), 500

    # -------------------------------------------------------------------------
    # Careers, Roadmaps, and Recommendations (Stateless)
    # -------------------------------------------------------------------------
    @app.route("/api/careers", methods=["GET"])
    def get_careers():
        try:
            from roadmap_engine.roadmap_generator import get_all_roles_summary
            return jsonify({"careers": get_all_roles_summary()})
        except Exception as e:
            logger.error(f"Careers list error: {e}")
            return jsonify({"careers": []})

    @app.route("/api/roadmap", methods=["POST"])
    def get_roadmap():
        try:
            from roadmap_engine.roadmap_generator import generate_roadmap
            data = request.get_json() or {}
            roadmap = generate_roadmap(
                data.get("career_role", "data_scientist"),
                data.get("current_semester", 1),
                data.get("known_skills", [])
            )
            return jsonify(roadmap)
        except Exception as e:
            logger.error(f"Roadmap generator error: {e}")
            return jsonify({"error": "Failed to generate roadmap."}), 500

    @app.route("/api/recommendations", methods=["POST"])
    def get_recommendations():
        try:
            from roadmap_engine.recommendation_engine import get_recommendations as _get_recs
            data = request.get_json() or {}
            recs = _get_recs(
                data.get("career_role", "data_scientist"),
                data.get("current_semester", 1),
                data.get("missing_skills", []),
                data.get("prefer_free", True)
            )
            return jsonify(recs)
        except Exception as e:
            logger.error(f"Recommendations error: {e}")
            return jsonify({"error": "Failed to generate recommendations."}), 500

    @app.route("/api/skill-gap", methods=["POST"])
    def skill_gap():
        try:
            from nlp_module.intent_engine import get_skill_gap
            data = request.get_json() or {}
            gap = get_skill_gap(data.get("user_skills", []), data.get("target_role", "data_scientist"))
            return jsonify(gap)
        except Exception as e:
            logger.error(f"Skill gap analysis error: {e}")
            return jsonify({"error": "Failed to compute skill gap."}), 500

    # Global payload too large error handler
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({"error": "File size exceeds the 3MB limit. Please upload a smaller document."}), 413

    # Global 404 handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Resource not found."}), 404

    # Global 500 handler to protect stack traces
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "An unexpected server error occurred. Please try again later."}), 500

    # Serve the built React frontend when frontend/dist exists (production Docker deploys)
    dist_dir = Path(__file__).parent.parent / "frontend" / "dist"
    if dist_dir.is_dir():
        logger.info(f"Serving frontend build from {dist_dir}")

        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path.startswith("api/"):
                return jsonify({"error": "Resource not found."}), 404
            candidate = dist_dir / path
            if path and candidate.is_file():
                return send_from_directory(dist_dir, path)
            return send_from_directory(dist_dir, "index.html")

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Aura AI Backend running on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)
