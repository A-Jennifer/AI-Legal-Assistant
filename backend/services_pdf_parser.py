"""
PDF Parser Service
Handles PDF file upload and text extraction
"""

import pdfplumber
import os
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Create uploads folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Save uploaded file and return path"""
    if file.filename == '':
        raise ValueError("No selected file")
    
    if not allowed_file(file.filename):
        raise ValueError("Only PDF files are allowed")
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    return filepath

def extract_text_from_pdf(filepath):
    """Extract all text from PDF file"""
    try:
        text = ""
        with pdfplumber.open(filepath) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                page_text = page.extract_text()
                if page_text:
                    text += f"\n--- PAGE {page_num} ---\n{page_text}"
        
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")

def extract_clauses_from_text(text):
    """
    Split text into potential clauses
    Looks for common clause patterns
    """
    clauses = []
    lines = text.split('\n')
    
    current_clause = ""
    clause_patterns = [
        'CLAUSE', 'SECTION', 'ARTICLE', 'TERM', 'CONDITION',
        'LIABILITY', 'INDEMNIF', 'PAYMENT', 'WARRANTY', 'TERMINATION',
        'CONFIDENTIAL', 'INTELLECTUAL', 'GOVERNING', 'DISPUTE'
    ]
    
    for line in lines:
        line_upper = line.upper()
        
        # Check if line starts a new clause
        is_clause_start = any(pattern in line_upper for pattern in clause_patterns)
        
        if is_clause_start and current_clause.strip():
            clauses.append(current_clause.strip())
            current_clause = line
        else:
            current_clause += "\n" + line
    
    # Don't forget the last clause
    if current_clause.strip():
        clauses.append(current_clause.strip())
    
    return clauses

def get_pdf_metadata(filepath):
    """Extract metadata from PDF"""
    try:
        with pdfplumber.open(filepath) as pdf:
            return {
                "total_pages": len(pdf.pages),
                "metadata": pdf.metadata or {}
            }
    except Exception as e:
        return {"error": str(e)}