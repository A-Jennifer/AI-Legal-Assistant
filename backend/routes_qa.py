"""
Q&A Route
Handles question-answer interactions about documents
"""

from flask import Blueprint, request, jsonify
from services_llm_handler import answer_question_about_document

qa_bp = Blueprint('qa', __name__)

# Store conversation history (in production, use database)
conversation_history = {}

@qa_bp.route('/ask-question', methods=['POST'])
def ask_question():
    """
    Answer a question about the uploaded contract
    """
    try:
        data = request.get_json()
        question = data.get('question', '')
        document_text = data.get('document_text', '')
        session_id = data.get('session_id', 'default')
        
        if not question or not document_text:
            return jsonify({"error": "Question and document_text required"}), 400
        
        # Get answer from Claude
        answer = answer_question_about_document(document_text, question)
        
        # Store in conversation history
        if session_id not in conversation_history:
            conversation_history[session_id] = []
        
        conversation_history[session_id].append({
            "question": question,
            "answer": answer
        })
        
        return jsonify({
            "success": True,
            "question": question,
            "answer": answer,
            "session_id": session_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@qa_bp.route('/conversation-history/<session_id>', methods=['GET'])
def get_history(session_id):
    """
    Get conversation history for a session
    """
    try:
        history = conversation_history.get(session_id, [])
        
        return jsonify({
            "success": True,
            "session_id": session_id,
            "history": history,
            "message_count": len(history)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@qa_bp.route('/clear-history/<session_id>', methods=['DELETE'])
def clear_history(session_id):
    """
    Clear conversation history for a session
    """
    try:
        if session_id in conversation_history:
            del conversation_history[session_id]
        
        return jsonify({
            "success": True,
            "message": "History cleared"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500