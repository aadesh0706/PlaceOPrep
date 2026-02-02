import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import SubmissionHistory from './SubmissionHistory';

export default function CodingCompiler({ question, language: initialLanguage = 'python', onCodeChange, onSubmit, loading }) {
  const [code, setCode] = useState(question?.boilerplateCode?.[initialLanguage] || '');
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [leftWidth, setLeftWidth] = useState(50);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const containerRef = useRef(null);
  const leftPanelRef = useRef(null);

  const handleCodeChange = (value) => {
    setCode(value || '');
    onCodeChange && onCodeChange(value, language);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput('Error: Please write some code before submitting.');
      return;
    }
    setOutput('Running...');
    try {
      const result = await onSubmit({ code, language, input });
      if (result?.output) {
        setOutput(result.output);
        // Refresh submission history if submission was successful
        if (result.output.includes('submitted successfully') || result.output.includes('Accepted')) {
          setRefreshHistory(prev => prev + 1);
        }
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleReset = () => {
    const resetCode = question?.boilerplateCode?.[language] || '';
    setCode(resetCode);
    setOutput('');
    setInput('');
    onCodeChange && onCodeChange(resetCode, language);
  };

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  useEffect(() => {
    const newCode = question?.boilerplateCode?.[language] || '';
    setCode(newCode);
    onCodeChange && onCodeChange(newCode, language);
  }, [language, question]);

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-100">
      <div
        ref={leftPanelRef}
        className="bg-white shadow-lg overflow-hidden flex flex-col"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 flex items-center space-x-2">
          <Code className="w-5 h-5" />
          <h2 className="font-bold text-lg">Problem Statement</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {question ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{question.title}</h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {question.description}
                </div>
              </div>

              {question.testCases && question.testCases.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Test Cases:</h4>
                  <div className="space-y-3">
                    {question.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-sm">
                          <div className="mb-2">
                            <span className="font-semibold text-gray-700">Input:</span>
                            <pre className="mt-1 bg-gray-800 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                              {testCase.input}
                            </pre>
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Expected Output:</span>
                            <pre className="mt-1 bg-gray-800 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                              {testCase.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {question.expectedApproach && (
                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <h4 className="font-semibold text-blue-900 mb-2">Expected Approach:</h4>
                  <p className="text-blue-800 text-sm">{question.expectedApproach}</p>
                </div>
              )}

              {question.hints && question.hints.length > 0 && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <h4 className="font-semibold text-yellow-900 mb-2">💡 Hints:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                    {question.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submission History */}
              <div className="mt-6">
                <SubmissionHistory 
                  questionId={question._id || question.problem_id} 
                  refreshTrigger={refreshHistory}
                  key={question._id || question.problem_id} 
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>No question selected</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="w-1 bg-gray-300 hover:bg-purple-500 cursor-col-resize transition-colors flex items-center justify-center group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-8 h-12 bg-gray-400 group-hover:bg-purple-500 rounded flex items-center justify-center transition-colors">
          <ChevronLeft className="w-4 h-4 text-white opacity-50" />
          <ChevronRight className="w-4 h-4 text-white opacity-50" />
        </div>
      </div>

      <div
        className="bg-white shadow-lg overflow-hidden flex flex-col"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-semibold">Language:</label>
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                }}
                className="bg-white text-gray-800 border-2 border-white rounded-lg px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-semibold transition-all flex items-center space-x-2"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !code.trim()}
                className="px-6 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{loading ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 border-t border-gray-200">
          <Editor
            height="60%"
            language={language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true
            }}
          />
          
          <div className="h-40 border-t border-gray-200 bg-gray-800 p-4">
            <div className="mb-2">
              <label className="block text-white text-sm font-semibold mb-2">Input:</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input here (one value per line)..."
                className="w-full h-24 bg-gray-900 text-green-400 font-mono text-sm p-2 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {output && (
          <div className="border-t border-gray-200 bg-gray-900 text-green-400 p-4 font-mono text-sm max-h-48 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white">Output:</span>
              <button
                onClick={() => setOutput('')}
                className="text-gray-400 hover:text-white text-xs"
              >
                Clear
              </button>
            </div>
            <pre className="whitespace-pre-wrap">{output}</pre>
            
            {/* Test Case Results */}
            {question?.testCases && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                <div className="text-white font-semibold mb-2">Test Cases:</div>
                {question.testCases.map((testCase, index) => {
                  const expectedOutput = testCase.expectedOutput?.trim();
                  const actualOutput = output?.trim();
                  const isCorrect = expectedOutput === actualOutput;
                  
                  return (
                    <div key={index} className={`mb-2 p-2 rounded border ${
                      isCorrect ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${
                          isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="text-xs text-gray-300">Test Case {index + 1}</span>
                        <span className={`text-xs font-semibold ${
                          isCorrect ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isCorrect ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        <div>Input: {testCase.input}</div>
                        <div>Expected: {expectedOutput}</div>
                        <div>Got: {actualOutput}</div>
                      </div>
                    </div>
                  );
                })}
                
                {/* All Test Cases Pass Message */}
                {question.testCases.every(testCase => 
                  testCase.expectedOutput?.trim() === output?.trim()
                ) && output?.trim() && (
                  <div className="mt-3 p-3 bg-green-900/30 border border-green-500 rounded">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-green-400 font-semibold">All test cases pass!</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
