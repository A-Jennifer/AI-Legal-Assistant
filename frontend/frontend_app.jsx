import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader, Trash2, Send } from 'lucide-react';
import './App.css';

export default function AILegalAssistant() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [qnaQuestion, setQnaQuestion] = useState('');
  const [qnaLoading, setQnaLoading] = useState(false);
  const [qnaHistory, setQnaHistory] = useState([]);
  const fileInputRef = useRef(null);

  const API_BASE_URL = 'http://localhost:5000/api';

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setQnaHistory([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResults(data);
        setActiveTab('overview');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!qnaQuestion.trim() || !results) return;

    setQnaLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qnaQuestion,
          document_text: results.full_text,
          session_id: 'session_1',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setQnaHistory([...qnaHistory, { question: qnaQuestion, answer: data.answer }]);
        setQnaQuestion('');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setQnaLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResults(null);
    setQnaHistory([]);
    setQnaQuestion('');
    setActiveTab('overview');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="sticky top-0 z-50 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">LegalAI</h1>
          </div>
          <p className="text-slate-400 text-sm">Smart Contract Analysis</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {!results ? (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-2xl">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-12 border border-slate-600/50 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-4xl font-bold text-white mb-3">Upload Your Contract</h2>
                  <p className="text-slate-300">Let AI analyze and explain your legal documents</p>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-slate-500 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all duration-300 group"
                >
                  <Upload className="w-16 h-16 text-slate-400 group-hover:text-blue-500 mx-auto mb-4 transition-colors" />
                  <h3 className="text-xl font-semibold text-white mb-2">Drop your PDF here</h3>
                  <p className="text-slate-400 mb-4">or click to browse from your computer</p>
                  <p className="text-sm text-slate-500">Supported: PDF (Max 16MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {file && (
                  <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-slate-300 text-sm">
                      📄 <span className="font-semibold">{file.name}</span>
                    </p>
                  </div>
                )}

                {loading && (
                  <div className="mt-8 flex items-center justify-center">
                    <Loader className="w-8 h-8 text-blue-500 animate-spin mr-3" />
                    <p className="text-slate-300">Analyzing your document...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">📄 {results.file_name}</h2>
                <p className="text-slate-400">
                  {results.metadata.total_pages} pages • {results.total_clauses} clauses found
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                New Document
              </button>
            </div>

            <div className="flex gap-2 border-b border-slate-700">
              {['overview', 'clauses', 'obligations', 'qna'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium transition-all ${
                    activeTab === tab
                      ? 'text-blue-400 border-b-2 border-blue-500'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab === 'overview' && '📊 Overview'}
                  {tab === 'clauses' && '⚖️ Clauses'}
                  {tab === 'obligations' && '✓ Obligations'}
                  {tab === 'qna' && '💬 Ask AI'}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-500/20">
                  <FileText className="w-8 h-8 text-blue-400 mb-3" />
                  <p className="text-slate-400 text-sm">Total Pages</p>
                  <p className="text-3xl font-bold text-white mt-1">{results.metadata.total_pages}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-6 border border-purple-500/20">
                  <AlertCircle className="w-8 h-8 text-purple-400 mb-3" />
                  <p className="text-slate-400 text-sm">Clauses Found</p>
                  <p className="text-3xl font-bold text-white mt-1">{results.total_clauses}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl p-6 border border-amber-500/20">
                  <CheckCircle className="w-8 h-8 text-amber-400 mb-3" />
                  <p className="text-slate-400 text-sm">Analyzed</p>
                  <p className="text-3xl font-bold text-white mt-1">{results.clauses_analyzed.length}</p>
                </div>
              </div>
            )}

            {activeTab === 'clauses' && (
              <div className="space-y-4">
                {results.clauses_analyzed.map((clause, idx) => (
                  <div key={idx} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                    <h4 className="font-semibold text-white mb-3">Clause {clause.id + 1}</h4>
                    <div className="mb-4">
                      {clause.risk_assessment.includes('HIGH') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-medium border border-red-500/30">
                          <AlertCircle className="w-3 h-3" /> High Risk
                        </span>
                      )}
                      {clause.risk_assessment.includes('MEDIUM') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-medium border border-amber-500/30">
                          <AlertCircle className="w-3 h-3" /> Medium Risk
                        </span>
                      )}
                      {clause.risk_assessment.includes('LOW') && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30">
                          <CheckCircle className="w-3 h-3" /> Low Risk
                        </span>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-slate-400 font-medium mb-2">Summary:</p>
                      <p className="text-slate-300">{clause.summary}</p>
                    </div>
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                      <p className="text-sm text-slate-400 font-medium mb-2">⚠️ Risk Assessment:</p>
                    <div className="text-slate-300 text-sm space-y-1">
  {clause.risk_assessment.split('\n').filter(line => line.trim()).map((line, idx) => (
    <div key={idx} className="flex items-start gap-2">
      <span className="text-blue-400 font-bold min-w-[20px]">{idx + 1}.</span>
      <span>{line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
    </div>
  ))}
</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'obligations' && (
              <div className="bg-slate-800/50 rounded-xl p-8 border border-slate-700/50">
                <h3 className="text-2xl font-bold text-white mb-6">Key Obligations & Deadlines</h3>
               <div className="bg-slate-900/50 p-6 rounded-lg text-slate-300 text-sm space-y-2">
  {results.key_obligations.split('\n').filter(line => line.trim()).map((line, idx) => (
    <div key={idx} className="flex items-start gap-2 py-1 border-b border-slate-700/30">
      <span className="text-blue-400 font-bold min-w-[20px]">{idx + 1}.</span>
      <span>{line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '')}</span>
    </div>
  ))}
</div>
              </div>
            )}

            {activeTab === 'qna' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <label className="block text-sm font-semibold text-slate-300 mb-3">Ask about the contract:</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={qnaQuestion}
                      onChange={(e) => setQnaQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAskQuestion()}
                      placeholder="e.g., What are the payment terms?"
                      className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={handleAskQuestion}
                      disabled={!qnaQuestion.trim() || qnaLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {qnaLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {qnaHistory.map((item, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex justify-end">
                        <div className="max-w-md bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
                          <p className="text-blue-300">{item.question}</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="max-w-md bg-slate-700/50 border border-slate-600/50 rounded-lg p-4">
                          <p className="text-slate-300">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-slate-700/50 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-400 text-sm">
          <p>🏛️ AI Legal Assistant</p>
        </div>
      </footer>
    </div>
  );
}