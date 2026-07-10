"""
Analyze Route
Handles advanced analysis features (explain terms, obligations, comparison)
"""

from flask import Blueprint, request, jsonify
from services_llm_handler import (
    explain_legal_terms,
    extract_key_obligations,
    compare_contracts,
)

analyze_bp = Blueprint('analyze', __name__)

@analyze_bp.route('/explain-terms', methods=['POST'])
def explain_terms():
    """
    Explain legal jargon in simple English
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        explanation = explain_legal_terms(text)
        
        return jsonify({
            "success": True,
            "original_text": text,
            "simple_explanation": explanation
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analyze_bp.route('/extract-obligations', methods=['POST'])
def extract_obligations():
    """
    Extract key obligations and deadlines
    """
    try:
        data = request.get_json()
        document_text = data.get('document_text', '')
        
        if not document_text:
            return jsonify({"error": "No document text provided"}), 400
        
        obligations = extract_key_obligations(document_text)
        
        return jsonify({
            "success": True,
            "obligations": obligations
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analyze_bp.route('/compare-contracts', methods=['POST'])
def compare_two_contracts():
    """
    Compare two contract versions
    """
    try:
        data = request.get_json()
        contract1 = data.get('contract1', '')
        contract2 = data.get('contract2', '')
        
        if not contract1 or not contract2:
            return jsonify({"error": "Both contract texts required"}), 400
        
        comparison = compare_contracts(contract1, contract2)
        
        return jsonify({
            "success": True,
            "comparison": comparison
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@analyze_bp.route('/review-checklist', methods=['POST'])
def review_checklist():
    """
    Generate review checklist for contract
    """
    try:
        data = request.get_json()
        document_text = data.get('document_text', '')
        
        if not document_text:
            return jsonify({"error": "No document text provided"}), 400
        
        return jsonify({
            "success": True,
            "checklist": "✓ Review all clauses carefully\n✓ Check payment terms\n✓ Verify termination clauses\n✓ Review liability limitations\n✓ Check non-compete agreements"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500