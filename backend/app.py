"""
AI Legal Assistant Backend
Main Flask application entry point
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import traceback

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Import routes
from routes_upload import upload_bp
from routes_analyze import analyze_bp
from routes_qa import qa_bp

# Register blueprints
app.register_blueprint(upload_bp, url_prefix='/api')
app.register_blueprint(analyze_bp, url_prefix='/api')
app.register_blueprint(qa_bp, url_prefix='/api')

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "Backend is running! ✅",
        "version": "1.0.0",
        "claude_api_key": "Configured" if os.getenv('ANTHROPIC_API_KEY') else "Missing"
    })

# Error handler
@app.errorhandler(500)
def internal_error(error):
    traceback.print_exc()
    return jsonify({"error": "Internal server error", "details": str(error)}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request", "details": str(error)}), 400

if __name__ == '__main__':
    print("🚀 AI Legal Assistant Backend Starting...")
    print("📍 Server: http://localhost:5000")
    print("📚 API Docs: http://localhost:5000/api/health")
    app.run(debug=True, port=5000)