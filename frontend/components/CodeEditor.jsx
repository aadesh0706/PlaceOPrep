import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronLeft, ChevronRight, Play, RotateCcw, Cloud, FileText, MessageSquare, RefreshCw, CheckCircle, XCircle, Check, X } from 'lucide-react';

// Result comparison function
function compareResults(output, expected) {
  if (!output && !expected) return true;
  if (!output || !expected) return false;
  
  // Normalize strings by trimming whitespace and removing extra formatting
  const normalize = (str) => {
    return String(str)
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[\[\]{}(),]/g, '')
      .toLowerCase();
  };
  
  return normalize(output) === normalize(expected);
}

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

export default function CodeEditor({ question, language: initialLanguage = 'javascript', onCodeChange, onSubmit, loading, submissions = [], context }) {
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
  const [editorTab, setEditorTab] = useState('code');
  const [executionMode, setExecutionMode] = useState(null); // 'run' | 'submit'
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
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
      const errorResult = {
        output: {
          type: 'error',
          message: 'Please write some code before running.'
        },
        testResults: null
      };
      setRunResult(errorResult);
      setExecutionMode('run');
      setEditorTab('execution');
      return;
    }

    setIsRunning(true);
    setExecutionMode('run');
    setEditorTab('execution');

    try {
      const result = await onSubmit({ code, language, action: 'run' });
      
      // Process result for run (first test case only)
      let processedResult = { ...result };
      if (result?.testResults?.testCases && result.testResults.testCases.length > 0) {
        processedResult.testResults = {
          ...result.testResults,
          testCases: [result.testResults.testCases[0]] // Only first test case
        };
      }
      
      setRunResult(processedResult);
    } catch (error) {
      setRunResult({
        output: {
          type: 'error',
          message: error.message || 'Error running code'
        },
        testResults: null
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      const errorResult = {
        output: {
          type: 'error',
          message: 'Please write some code before submitting.'
        },
        testResults: null
      };
      setSubmitResult(errorResult);
      setExecutionMode('submit');
      setEditorTab('execution');
      return;
    }

    setIsSubmitting(true);
    setExecutionMode('submit');
    setEditorTab('execution');

    try {
      const result = await onSubmit({ code, language, action: 'submit' });
      setSubmitResult(result);
    } catch (error) {
      setSubmitResult({
        output: {
          type: 'error',
          message: error.message || 'Error submitting code'
        },
        testResults: null
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
    setRunResult(null);
    setSubmitResult(null);
    setExecutionMode(null);
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
        setRunResult(null);
        setSubmitResult(null);
        setExecutionMode(null);
        setEditorTab('code');
        onCodeChange && onCodeChange(newCode, language);
        if (editorRef.current) {
          editorRef.current.setValue(newCode);
        }
      }
    }
  }, [question, language]);

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'text-green-600';
    if (diff === 'intermediate' || diff === 'medium') return 'text-amber-600';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'text-red-600';
    return 'text-gray-600';
  };

  const getDifficultyBg = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'bg-green-100 text-green-800';
    if (diff === 'intermediate' || diff === 'medium') return 'bg-amber-100 text-amber-800';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTags = (question) => {
    const tags = [];
    const desc = (question.description || '').toLowerCase();
    const title = (question.title || '').toLowerCase();
    
    if (title.includes('two sum') || title.includes('three sum')) tags.push('Arrays');
    if (title.includes('valid parentheses') || desc.includes('parentheses')) tags.push('Stack');
    if (title.includes('linked list') || desc.includes('linked list')) tags.push('Linked List');
    if (title.includes('substring') || desc.includes('substring')) tags.push('String');
    if (title.includes('subarray') || desc.includes('subarray')) tags.push('Arrays');
    if (desc.includes('graph')) tags.push('Graph');
    if (desc.includes('tree')) tags.push('Tree');
    if (desc.includes('dynamic') || desc.includes('dp')) tags.push('DP');
    
    if (tags.length === 0) tags.push('Arrays');
    return tags.slice(0, 1);
  };

  const getDifficultyLabel = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    if (diff === 'beginner' || diff === 'easy') return 'Easy';
    if (diff === 'intermediate' || diff === 'medium') return 'Medium';
    if (diff === 'advanced' || diff === 'hard' || diff === 'pro') return 'Hard';
    return 'Medium';
  };

  return (
    <div ref={containerRef} className="flex h-full bg-[#F8F9FB]" style={{ position: 'relative' }}>
      {/* Left Panel - Question */}
      <div
        className="bg-white overflow-hidden flex flex-col border-r border-gray-200"
        style={{ width: `${leftWidth}%` }}
      >
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('description')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Description</span>
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'solutions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm font-medium">Solutions</span>
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center space-x-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'submissions'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
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
              <div className="space-y-6 text-gray-700">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {question.title || 'Untitled Problem'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${getDifficultyBg(question.difficulty)}`}>
                      {getDifficultyLabel(question.difficulty)}
                    </span>
                    {getTags(question).map((tag, i) => (
                      <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700">
                        {tag}
                      </span>
                    ))}
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      Time 1s
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600">
                      Memory 256MB
                    </span>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {cleanDescription(question.description)}
                  </p>
                </div>

                {/* Examples Section - Render only once */}
                {((question.testCases && question.testCases.length > 0) || (question.examples && question.examples.length > 0)) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900">Examples:</h2>
                    
                    {/* Render from testCases if available */}
                    {question.testCases && question.testCases.length > 0 && question.testCases.map((testCase, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="text-sm font-semibold text-gray-600 mb-2">Example {index + 1}:</div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-gray-600">Input: </span>
                            <code className="text-gray-800 bg-white px-2 py-1 rounded border">{testCase.input}</code>
                          </div>
                          <div>
                            <span className="text-gray-600">Output: </span>
                            <code className="text-gray-800 bg-white px-2 py-1 rounded border">{testCase.expectedOutput}</code>
                          </div>
                          {testCase.explanation && (
                            <div className="text-gray-600 text-sm mt-2">
                              <span className="font-semibold">Explanation: </span>
                              {testCase.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Render from examples if testCases not available */}
                    {(!question.testCases || question.testCases.length === 0) && question.examples && question.examples.length > 0 && question.examples.map((example, index) => {
                      const exampleText = example.example_text || example.text || '';
                      const hasInputOutput = exampleText.includes('Input:') && exampleText.includes('Output:');
                      
                      if (hasInputOutput) {
                        const lines = exampleText.split('\n');
                        let inputText = '';
                        let outputText = '';
                        let explanationText = '';
                        
                        lines.forEach(line => {
                          if (line.startsWith('Input:')) {
                            inputText = line.replace('Input:', '').trim();
                          } else if (line.startsWith('Output:')) {
                            outputText = line.replace('Output:', '').trim();
                          } else if (line.startsWith('Explanation:')) {
                            explanationText = line.replace('Explanation:', '').trim();
                          }
                        });
                        
                        return (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Example {index + 1}:</div>
                            <div className="space-y-2">
                              <div>
                                <span className="text-gray-600">Input: </span>
                                <code className="text-gray-800 bg-white px-2 py-1 rounded border">{inputText}</code>
                              </div>
                              <div>
                                <span className="text-gray-600">Output: </span>
                                <code className="text-gray-800 bg-white px-2 py-1 rounded border">{outputText}</code>
                              </div>
                              {explanationText && (
                                <div className="text-gray-600 text-sm mt-2">
                                  <span className="font-semibold">Explanation: </span>
                                  {explanationText}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="text-sm font-semibold text-gray-600 mb-2">Example {index + 1}:</div>
                            <div className="bg-white rounded-lg p-3 border">
                              <pre className="text-gray-800 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                                {exampleText}
                              </pre>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                )}

                {question.constraints && question.constraints.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Constraints:</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {question.constraints.map((constraint, i) => (
                        <li key={i} className="text-sm">{constraint}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!question.constraints && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Constraints:</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                      <li>2 &lt;= nums.length &lt;= 10<sup>4</sup></li>
                      <li>-10<sup>9</sup> &lt;= nums[i] &lt;= 10<sup>9</sup></li>
                      <li>-10<sup>9</sup> &lt;= target &lt;= 10<sup>9</sup></li>
                      <li>Only one valid answer exists.</li>
                    </ul>
                  </div>
                )}
              </div>
            ) : activeTab === 'solutions' ? (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Solutions will be available after solving the problem.</p>
              </div>
            ) : (
              <div className="submissions">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submissions</h3>
                
                <div className="submission-dropdown mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">View Submissions:</label>
                  <select
                    value={selectedSubmissionId}
                    onChange={handleSubmissionSelect}
                    className="bg-white border border-gray-300 text-gray-900 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
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
                    <h4 className="text-gray-900 font-medium mb-2">Submitted Code</h4>
                    <pre className="bg-gray-50 text-gray-800 p-3 rounded text-xs overflow-x-auto font-mono border border-gray-200">
                      {selectedCode}
                    </pre>
                  </div>
                )}

                {submissions.length === 0 ? (
                  <p className="text-gray-500">No submissions yet</p>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">{submissions.length} submission(s) found</p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 mt-8">
              <p>No question selected</p>
            </div>
          )}
        </div>
      </div>

      {/* Resizer */}
      <div
        className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors flex items-center justify-center group"
        onMouseDown={() => setIsResizing(true)}
      >
        <div className="w-8 h-12 bg-gray-400 group-hover:bg-gray-500 rounded flex items-center justify-center transition-colors">
          <ChevronLeft className="w-3 h-3 text-white" />
          <ChevronRight className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Right Panel - Editor with Tabs */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex">
                <button
                  onClick={() => setEditorTab('code')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    editorTab === 'code'
                      ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Code
                </button>
                <button
                  onClick={() => setEditorTab('execution')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    editorTab === 'execution'
                      ? 'bg-purple-100 text-purple-700 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Execution
                </button>
              </div>
              
              {editorTab === 'code' && (
                <select
                  value={language}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setLanguage(newLang);
                  }}
                  className="bg-white border border-gray-300 text-gray-900 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {editorTab === 'code' && (
                <button
                  onClick={handleReset}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Reset code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleRun}
                disabled={isRunning || isSubmitting || !code.trim()}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Run</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isRunning || !code.trim()}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Cloud className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {editorTab === 'code' ? (
            <div className="h-full">
              <Editor
                height="100%"
                width="100%"
                language={languages.find(l => l.value === language)?.monacoLang || language}
                value={code}
                onChange={handleCodeChange}
                theme="light"
                loading={<div className="flex items-center justify-center h-full text-gray-500">Loading editor...</div>}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  
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
          ) : (
            <div className="h-full overflow-y-auto bg-gray-50 p-6">
              {!executionMode || (!runResult && !submitResult) ? (
                <div className="text-center text-gray-500 py-16">
                  <Code className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No execution results yet</p>
                  <p className="text-sm">Run your code to see the output here</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-6">
                  {(() => {
                    const currentResult = executionMode === 'run' ? runResult : submitResult;
                    const currentOutput = currentResult?.output;
                    const currentTestResults = currentResult?.testResults;
                    
                    // Calculate overall status based on test case results
                    let overallPassed = false;
                    if (currentTestResults?.testCases && currentTestResults.testCases.length > 0) {
                      overallPassed = currentTestResults.testCases.every(testCase => 
                        compareResults(testCase.output, testCase.expected)
                      );
                    }
                    
                    return (
                      <>
                        {/* Status Banner */}
                        {(currentOutput || currentTestResults) && (
                          <div className={`rounded-xl p-4 ${
                            overallPassed
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-red-50 border border-red-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                {overallPassed ? (
                                  <CheckCircle className="w-6 h-6 text-green-600" />
                                ) : (
                                  <XCircle className="w-6 h-6 text-red-600" />
                                )}
                                <div>
                                  <h3 className={`font-semibold ${
                                    overallPassed ? 'text-green-800' : 'text-red-800'
                                  }`}>
                                    {overallPassed ? 'Accepted' : 'Wrong Answer'}
                                  </h3>
                                  {currentOutput?.runtime && (
                                    <p className={`text-sm ${
                                      overallPassed ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      Runtime: {currentOutput.runtime}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  executionMode === 'run' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-purple-100 text-purple-800'
                                }`}>
                                  {executionMode === 'run' ? 'Run Result' : 'Submit Result'}
                                </span>
                                <p className="text-xs text-gray-500 mt-1">
                                  {executionMode === 'run' 
                                    ? 'Showing result for sample test case'
                                    : 'Showing results for all test cases'
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Test Cases Results */}
                        {currentTestResults && currentTestResults.testCases && currentTestResults.testCases.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-800">
                              Test Cases {executionMode === 'run' ? '(Sample)' : ''}
                            </h4>
                            {currentTestResults.testCases.map((testCase, index) => {
                              const testPassed = compareResults(testCase.output, testCase.expected);
                              return (
                                <div key={index} className={`bg-white rounded-xl p-6 shadow-sm border ${
                                  testPassed ? 'border-green-200' : 'border-red-200'
                                }`}>
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="text-sm font-medium text-gray-700">Test Case {index + 1}</h5>
                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
                                      testPassed 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {testPassed ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                      <span>{testPassed ? 'Passed' : 'Failed'}</span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                                    <div className="min-w-0">
                                      <h5 className="text-sm font-medium text-gray-600 mb-2">Input</h5>
                                      <div className="bg-gray-50 rounded-lg p-3 font-mono text-sm text-gray-800 max-h-32 overflow-y-auto break-words">
                                        {testCase.input}
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-sm font-medium text-gray-600 mb-2">Your Output</h5>
                                      <div className={`rounded-lg p-3 font-mono text-sm max-h-32 overflow-y-auto break-words ${
                                        testPassed 
                                          ? 'bg-green-50 text-green-800' 
                                          : 'bg-red-50 text-red-800'
                                      }`}>
                                        {testCase.output || 'No output'}
                                      </div>
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-sm font-medium text-gray-600 mb-2">Expected</h5>
                                      <div className="bg-green-50 rounded-lg p-3 font-mono text-sm text-green-800 max-h-32 overflow-y-auto break-words">
                                        {testCase.expected}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Console Output */}
                        {currentOutput && currentOutput.message && (
                          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Console Output</h4>
                            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800 whitespace-pre-wrap">
                              {currentOutput.message}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()
                  }
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
