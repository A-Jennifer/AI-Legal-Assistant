"""
Upload Route
Handles PDF file uploads and initial processing
"""

from flask import Blueprint, request, jsonify
import json
import sys
sys.path.append('.')

from services_pdf_parser import (
    save_uploaded_file, 
    extract_text_from_pdf,
    extract_clauses_from_text,
    get_pdf_metadata
)
from services_llm_handler import (
    summarize_clause,
    detect_risks,
    extract_key_obligations
)

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_pdf():
    """
    Handle PDF upload and initial analysis
    Returns: clauses, summaries, and risk assessment
    """
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        
        # Save file
        filepath = save_uploaded_file(file)
        
        # Extract text
        full_text = extract_text_from_pdf(filepath)
        
        # Get metadata
        metadata = get_pdf_metadata(filepath)
        
        # Extract clauses
        clauses = extract_clauses_from_text(full_text)
        
        # Analyze first few clauses with LLM
        analyzed_clauses = []
        for i, clause in enumerate(clauses[:5]):  # Limit to first 5 for speed
            summary = summarize_clause(clause)
            risk = detect_risks(clause)
            
            analyzed_clauses.append({
                "id": i,
                "text": clause[:500] + "..." if len(clause) > 500 else clause,
                "summary": summary,
                "risk_assessment": risk
            })
        
        # Extract obligations
        obligations = extract_key_obligations(full_text)
        
        return jsonify({
            "success": True,
            "file_name": file.filename,
            "metadata": metadata,
            "total_clauses": len(clauses),
            "clauses_analyzed": analyzed_clauses,
            "key_obligations": obligations,
            "full_text": full_text
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@upload_bp.route('/analyze-clause', methods=['POST'])
def analyze_specific_clause():
    """
    Analyze a specific clause provided in request
    """
    try:
        data = request.get_json()
        clause_text = data.get('clause_text', '')
        
        if not clause_text:
            return jsonify({"error": "No clause text provided"}), 400
        
        summary = summarize_clause(clause_text)
        risk = detect_risks(clause_text)
        
        return jsonify({
            "success": True,
            "summary": summary,
            "risk_assessment": risk
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500