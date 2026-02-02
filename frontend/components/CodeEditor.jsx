import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronLeft, ChevronRight, Play, RotateCcw, Cloud, FileText, MessageSquare, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

// Description sanitizer function
function cleanDescription(description) {
  if (!description) return "";

  return description
    // Remove "Example 1:", "Example 2:", etc.
    .replace(/\n?Example\s*\d+:\n?/gi, "")
    // Remove "Constraints:"
    .replace(/\n?Constraints:\n?/gi, "")
    // Remove extra empty lines
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

export default function CodeEditor({ question, language: initialLanguage = 'javascript', onCodeChange, onSubmit, loading, submissions = [] }) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState(null);
  const [isResizing, setIsResizing] = useState(false);
  const [leftWidth, setLeftWidth] = useState(40);
  const [activeTab, setActiveTab] = useState('description');
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const questionRef = useRef(null);

  const handleSubmissionSelect = (e) => {
    const submissionId = e.target.value;
    setSelectedSubmissionId(submissionId);

    const submission = submissions.find(
      (s) => s._id === submissionId
    );

    setSelectedCode(submission?.code || '');
  };

  const handleCodeChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    onCodeChange && onCodeChange(newCode, language);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      setOutput({
        type: 'error',
        message: 'Please write some code before running.'
      });
      return;
    }

    setIsRunning(true);
    setOutput(null);
    setTestResults(null);

    try {
      const result = await onSubmit({ code, language, action: 'run' });
      
      if (result?.testResults) {
        setTestResults(result.testResults);
        setOutput({
          type: result.testResults.passed ? 'success' : 'error',
          message: result.testResults.passed ? 'All test cases passed!' : 'Some test cases failed.',
          runtime: result.testResults.runtime || '0 ms'
        });
      } else if (result?.output) {
        setOutput({
          type: 'success',
          message: result.output,
          runtime: result.runtime || '0 ms'
        });
      }
    } catch (error) {
      setOutput({
        type: 'error',
        message: error.message || 'Error running code'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setOutput({
        type: 'error',
        message: 'Please write some code before submitting.'
      });
      return;
    }

    setIsSubmitting(true);
    setOutput(null);
    setTestResults(null);

    try {
      const result = await onSubmit({ code, language, action: 'submit' });
      
      if (result?.testResults) {
        setTestResults(result.testResults);
        setOutput({
          type: result.testResults.passed ? 'success' : 'error',
          message: result.message || (result.testResults.passed ? 'Submission successful! All test cases passed.' : 'Submission failed. Some test cases did not pass.'),
          runtime: result.testResults.runtime || result.runtime || '0 ms'
        });
      } else if (result?.output) {
        if (typeof result.output === 'object') {
          setOutput(result.output);
          if (result.testResults) {
            setTestResults(result.testResults);
          }
        } else {
          setOutput({
            type: 'success',
            message: result.output,
            runtime: result.runtime || '0 ms'
          });
        }
      } else if (result?.type) {
        setOutput({
          type: result.type,
          message: result.message || 'Submission completed',
          runtime: result.runtime || '0 ms'
        });
        if (result.testResults) {
          setTestResults(result.testResults);
        }
      }
    } catch (error) {
      setOutput({
        type: 'error',
        message: error.message || 'Error submitting code'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const resetCode = question?.boilerplateCode?.[language] || '';
    setCode(resetCode);
    setOutput(null);
    setTestResults(null);
    onCodeChange && onCodeChange(resetCode, language);
    if (editorRef.current) {
      editorRef.current.setValue(resetCode);
    }
  };

  const languages = [
    { value: 'javascript', label: 'JavaScript', monacoLang: 'javascript' },
    { value: 'python', label: 'Python', monacoLang: 'python' },
    { value: 'java', label: 'Java', monacoLang: 'java' },
    { value: 'cpp', label: 'C++', monacoLang: 'cpp' }
  ];

  useEffect(() => {
    if (selectedCode) {
      setCode(selectedCode);
      if (editorRef.current) {
        editorRef.current.setValue(selectedCode);
      }
    }
  }, [selectedCode]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newLeftWidth >= 25 && newLeftWidth <= 75) {
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
    if (question) {
      const questionId = question._id || question.title;
      const lastQuestionId = questionRef.current?._id || questionRef.current?.title;
      
      if (questionId !== lastQuestionId || language !== questionRef.current?.lastLanguage) {
        questionRef.current = { ...question, lastLanguage: language };
        const newCode = question?.boilerplateCode?.[language] || '';
        setCode(newCode);
        setOutput(null);
        setTestResults(null);
        onCodeChange && onCodeChange(newCode, language);
        if (editorRef.current) {
          editorRef.current.setValue(newCode);
        }
      }
    }
  }, [question, language]);

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'text-green-500';
    if (diff === 'intermediate' || diff === 'medium') return 'text-yellow-500';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'text-red-500';
    return 'text-gray-400';
  };

  const getDifficultyBg = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'bg-green-500/20 border-green-500/50';
    if (diff === 'intermediate' || diff === 'medium') return 'bg-yellow-500/20 border-yellow-500/50';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'bg-red-500/20 border-red-500/50';
    return 'bg-gray-500/20 border-gray-500/50';
  };

  const getDifficultyLabel = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'Easy';
    if (diff === 'intermediate' || diff === 'medium') return 'Medium';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'Hard';
    return 'Medium';
  };

  return (
    <div ref={containerRef} className="flex h-screen bg-gray-900" style={{ position: 'relative' }}>
      <div
        className="bg-gray-800 overflow-hidden flex flex-col border-r border-gray-700"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Description</span>
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'solutions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Solutions</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Submissions</span>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {question ? (
            activeTab === 'description' ? (
              <div className="space-y-6 text-gray-300">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-4">
                    {question._id ? `${question._id.toString().slice(-3)}. ` : ''}{question.title || 'Untitled Problem'}
                  </h1>
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`px-3 py-1 rounded text-xs font-semibold border ${getDifficultyBg(question.difficulty)} ${getDifficultyColor(question.difficulty)}`}>
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-medium bg-gray-700/50 border border-gray-600 text-gray-300">
                      1s
                    </span>
                    <span className="px-3 py-1 rounded text-xs font-medium bg-gray-700/50 border border-gray-600 text-gray-300">
                      256MB
                    </span>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {cleanDescription(question.description)}
                  </p>
                </div>

                {question.testCases && question.testCases.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-white">Examples:</h2>
                    {question.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                        <div className="text-sm font-semibold text-gray-400 mb-2">Example {index + 1}:</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-400">Input: </span>
                            <code className="text-gray-300 bg-gray-800 px-2 py-1 rounded">{testCase.input}</code>
                          </div>
                          <div>
                            <span className="text-gray-400">Output: </span>
                            <code className="text-gray-300 bg-gray-800 px-2 py-1 rounded">{testCase.expectedOutput}</code>
                          </div>
                          {testCase.explanation && (
                            <div className="text-gray-400 text-sm mt-2">
                              <span className="font-semibold">Explanation: </span>
                              {testCase.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {question.constraints && question.constraints.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Constraints:</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {question.constraints.map((constraint, i) => (
                        <li key={i} className="text-sm">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!question.constraints && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-3">Constraints:</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-300 text-sm">
                      <li>2 &lt;= nums.length &lt;= 10<sup>4</sup></li>
                      <li>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></li>
                      <li>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></li>
                      <li>Only one valid answer exists.</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : activeTab === 'solutions' ? (
              <div className="text-center text-gray-400 py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Solutions will be available after solving the problem.</p>
              </div>
            ) : (
              <div className="submissions">
                <h3 className="text-lg font-semibold text-white mb-4">Submissions</h3>
                
                <div className="submission-dropdown mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">View Submissions:</label>
                  <select
                    value={selectedSubmissionId}
                    onChange={handleSubmissionSelect}
                    className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  >
                    <option value="">Select a submission</option>
                    {submissions.map((s, index) => (
                      <option key={s._id} value={s._id}>
                        #{submissions.length - index} • {s.language} • {s.status} • {new Date(s.createdAt).toLocaleTimeString()}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCode && (
                  <div className="submitted-code">
                    <h4 className="text-white font-medium mb-2">Submitted Code</h4>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono border border-gray-700">
                      {selectedCode}
                    </pre>
                  </div>
                )}

                {submissions.length === 0 ? (
                  <p className="text-gray-400">No submissions yet</p>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-400 text-sm">{submissions.length} submission(s) found</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <p>No question selected</p>
            </div>
          )}
        </div>
      </div>

      <div
        className="w-1 bg-gray-700 hover:bg-gray-600 cursor-col-resize transition-colors flex items-center justify-center group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-8 h-12 bg-gray-600 group-hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
          <ChevronLeft className="w-3 h-3 text-gray-400" />
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      <div
        className="bg-gray-900 overflow-hidden flex flex-col"
        style={{ width: `${100 - leftWidth}%` }}
      >
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                }}
                className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
              <button
                onClick={handleReset}
                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded transition-colors"
                title="Reset code"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting || !code.trim()}
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning || !code.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Cloud className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 border-t border-gray-700 relative" style={{ minHeight: 0 }}>
          <Editor
            height="100%"
            width="100%"
            language={languages.find(l => l.value === language)?.monacoLang || language}
            value={code}
            onChange={handleCodeChange}
            theme="vs-dark"
            loading={<div className="flex items-center justify-center h-full text-gray-400">Loading editor...</div>}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              
              monaco.languages.setLanguageConfiguration('python', {
                comments: {
                  lineComment: '#',
                  blockComment: ['"""', '"""']
                },
                brackets: [
                  ['{', '}'],
                  ['[', ']'],
                  ['(', ')']
                ],
                autoClosingPairs: [
                  { open: '{', close: '}' },
                  { open: '[', close: ']' },
                  { open: '(', close: ')' },
                  { open: '"', close: '"' },
                  { open: "'", close: "'" }
                ]
              });

              monaco.languages.setLanguageConfiguration('java', {
                comments: {
                  lineComment: '//',
                  blockComment: ['/*', '*/']
                },
                brackets: [
                  ['{', '}'],
                  ['[', ']'],
                  ['(', ')']
                ],
                autoClosingPairs: [
                  { open: '{', close: '}' },
                  { open: '[', close: ']' },
                  { open: '(', close: ')' },
                  { open: '"', close: '"' }
                ]
              });

              monaco.languages.setLanguageConfiguration('cpp', {
                comments: {
                  lineComment: '//',
                  blockComment: ['/*', '*/']
                },
                brackets: [
                  ['{', '}'],
                  ['[', ']'],
                  ['(', ')']
                ],
                autoClosingPairs: [
                  { open: '{', close: '}' },
                  { open: '[', close: ']' },
                  { open: '(', close: ')' },
                  { open: '"', close: '"' }
                ]
              });

              setTimeout(() => {
                editor.focus();
                editor.updateOptions({
                  readOnly: false
                });
              }, 100);
            }}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: language === 'python' ? 4 : 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
              readOnly: false,
              domReadOnly: false,
              selectOnLineNumbers: true,
              roundedSelection: false,
              cursorStyle: 'line',
              cursorBlinking: 'blink',
              acceptSuggestionOnEnter: 'on',
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              autoIndent: 'full',
              bracketPairColorization: {
                enabled: true
              }
            }}
          />
        </div>

        {(output || testResults) && (
          <div className="border-t border-gray-700 bg-gray-800 flex flex-col" style={{ maxHeight: '300px' }}>
            <div className="flex border-b border-gray-700">
              <button className="px-4 py-2 text-sm font-medium text-blue-400 border-b-2 border-blue-500">
                Console
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-300">
                Test Cases
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {output && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    {output.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <span className={`font-semibold ${output.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                      {output.type === 'success' ? 'Accepted' : 'Wrong Answer'}
                    </span>
                    {output.runtime && (
                      <span className="text-gray-400 text-sm ml-auto">Runtime: {output.runtime}</span>
                    )}
                  </div>
                  {testResults && testResults.testCases && testResults.testCases.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {testResults.testCases.map((testCase, index) => (
                        <div key={index} className="bg-gray-900 border border-gray-700 rounded p-3">
                          <div className="text-xs space-y-2">
                            <div>
                              <span className="text-gray-500 uppercase text-xs">YOUR INPUT</span>
                              <div className="mt-1 bg-gray-950 text-gray-300 p-2 rounded font-mono text-xs">
                                {testCase.input}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 uppercase text-xs">YOUR OUTPUT</span>
                              <div className={`mt-1 bg-gray-950 p-2 rounded font-mono text-xs ${
                                testCase.passed ? 'text-green-400' : 'text-red-400'
                              }`}>
                                {testCase.output || 'No output'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 uppercase text-xs">EXPECTED</span>
                              <div className="mt-1 bg-gray-950 text-green-400 p-2 rounded font-mono text-xs">
                                {testCase.expected}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {output.message && (
                    <div className="text-gray-300 text-sm whitespace-pre-wrap">{output.message}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
