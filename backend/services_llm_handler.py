"""
LLM Handler Service
Uses Hugging Face Inference API (free tier) - Chat Completion
"""

import os
from huggingface_hub import InferenceClient

client = InferenceClient(token=os.getenv("HF_API_KEY"))

MODEL = "meta-llama/Llama-3.1-8B-Instruct"

def _ask(prompt, max_tokens=300):
    try:
        response = client.chat_completion(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL,
            max_tokens=max_tokens,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error: {str(e)}"

def summarize_clause(clause_text, max_tokens=300):
    prompt = f"""Summarize this legal clause in 2-3 sentences:

{clause_text}

Summary:"""
    return _ask(prompt, max_tokens)

def detect_risks(clause_text):
    prompt = f"""Analyze this legal clause for risks.
Rate as HIGH/MEDIUM/LOW risk and explain briefly:

{clause_text}

Risk Assessment:"""
    return _ask(prompt, 250)

def explain_legal_terms(text):
    prompt = f"""Explain this in simple, everyday English:

{text}

Explanation:"""
    return _ask(prompt, 300)

def extract_key_obligations(full_text):
    prompt = f"""Extract all key obligations, deadlines, and important dates.
Format as a bullet list:

{full_text[:2000]}

Key Obligations:"""
    return _ask(prompt, 400)

def answer_question_about_document(document_text, question):
    prompt = f"""Based on this contract, answer the question:

CONTRACT:
{document_text[:2000]}

QUESTION: {question}

ANSWER:"""
    return _ask(prompt, 300)

def compare_contracts(contract1_text, contract2_text):
    prompt = f"""Compare these contract versions. What changed?

VERSION 1:
{contract1_text[:1500]}

VERSION 2:
{contract2_text[:1500]}

Key Differences:"""
    return _ask(prompt, 500)