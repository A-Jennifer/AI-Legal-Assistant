# 🏛️ AI Legal Assistant

An intelligent legal document analyzer powered by AI.

## Features

- ✅ PDF upload and text extraction
- ✅ AI-powered clause summarization
- ✅ Risk detection for legal clauses
- ✅ Legal jargon explanation
- ✅ Key obligations extraction
- ✅ Q&A chatbot for contracts
- ✅ Contract comparison

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Python Flask
- **AI**: Claude API (Anthropic)
- **PDF Processing**: pdfplumber

## Quick Start

### Backend
```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
npm install
npm run dev
```

Open http://localhost:3000

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - Upload PDF
- `POST /api/explain-terms` - Explain legal terms
- `POST /api/extract-obligations` - Extract obligations
- `POST /api/ask-question` - Ask AI questions

## Environment Variables

Create `.env` file with: