"""
app.py
------
Flask application entry point.
Registers all blueprints, sets CORS headers, and exposes health endpoint.

Run:  python backend/app.py
Prod: gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from flask import Flask, jsonify
from routes.predict_routes   import predict_bp
from routes.analytics_routes import analytics_bp
from routes.report_routes    import report_bp
from utils.helpers            import logger


def create_app():
    app = Flask(__name__)

    # ── CORS (manual — no flask-cors dependency) ──────────────────────────────
    @app.after_request
    def add_cors_headers(response):
        response.headers["Access-Control-Allow-Origin"]  = "*"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        return response

    # ── Register blueprints ───────────────────────────────────────────────────
    app.register_blueprint(predict_bp,   url_prefix="/api")
    app.register_blueprint(analytics_bp, url_prefix="/api")
    app.register_blueprint(report_bp,    url_prefix="/api")

    # ── Health endpoint ───────────────────────────────────────────────────────
    @app.route("/api/health")
    def health():
        return jsonify({
            "status":  "ok",
            "service": "ChurnIQ — Customer Churn Prediction API",
            "version": "1.0.0",
            "endpoints": [
                "POST /api/predict",
                "GET  /api/analytics/dashboard",
                "GET  /api/analytics/summary",
                "POST /api/report/generate",
            ],
        })

    # ── 404 handler ───────────────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    # ── 500 handler ───────────────────────────────────────────────────────────
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    logger.info("Starting ChurnIQ API on http://localhost:5000")
    app.run(debug=True, port=5000, host="0.0.0.0")
