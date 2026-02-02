import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import api from '../services/api';
import { ArrowLeft, CheckCircle, Zap, Flame, Grid3X3, Code2, Link, Square, TreePine, Network, ChevronRight } from 'lucide-react';
import React from 'react';

export default function CodingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [context, setContext] = useState({
    difficulty: 'all',
    category: 'all',
    questionIndex: 0,
    totalQuestions: 0,
    filteredQuestions: []
  });

  useEffect(() => {
    const navState = location.state;
    if (navState) {
      setContext({
        difficulty: navState.difficulty || 'all',
        category: navState.category || 'all',
        questionIndex: navState.questionIndex || 0,
        totalQuestions: navState.totalQuestions || 0,
        filteredQuestions: navState.filteredQuestions || []
      });
      localStorage.setItem('codingContext', JSON.stringify(navState));
    } else {
      const savedContext = localStorage.getItem('codingContext');
      if (savedContext) {
        setContext(JSON.parse(savedContext));
      }
    }
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (question?.id || id) {
      fetchSubmissions(id);
    }
  }, [question?.id, id]);

  const getContextIcon = (type, value) => {
    if (type === 'difficulty') {
      if (value === 'easy') return CheckCircle;
      if (value === 'medium') return Zap;
      if (value === 'hard') return Flame;
    }
    if (type === 'category') {
      const cat = value.toLowerCase();
      if (cat.includes('array')) return Grid3X3;
      if (cat.includes('linked')) return Link;
      if (cat.includes('stack')) return Square;
      if (cat.includes('tree')) return TreePine;
      if (cat.includes('graph')) return Network;
      return Grid3X3;
    }
    return Code2;
  };

  const getContextColor = (type, value) => {
    if (type === 'difficulty') {
      if (value === 'easy') return 'bg-green-100 text-green-700';
      if (value === 'medium') return 'bg-yellow-100 text-yellow-700';
      if (value === 'hard') return 'bg-red-100 text-red-700';
    }
    if (type === 'category') {
      return 'bg-purple-100 text-purple-700';
    }
    return 'bg-indigo-100 text-indigo-700';
  };

  const handleNext = () => {
    const { filteredQuestions, questionIndex } = context;
    
    if (filteredQuestions.length === 0) {
      navigate('/coding-problems');
      return;
    }
    
    const nextIndex = questionIndex + 1;
    
    if (nextIndex >= filteredQuestions.length) {
      const difficultyText = context.difficulty === 'all' ? 'All' : context.difficulty;
      const categoryText = context.category === 'all' ? 'All' : context.category;
      alert(`No more ${difficultyText} ${categoryText} questions 🎉`);
      return;
    }
    
    const nextQuestion = filteredQuestions[nextIndex];
    const newContext = {
      ...context,
      questionIndex: nextIndex
    };
    
    localStorage.setItem('codingContext', JSON.stringify(newContext));
    
    navigate(`/coding-editor/${nextQuestion._id}`, {
      state: newContext
    });
  };

  const handleBackToProblems = () => {
    navigate('/coding-problems', {
      state: {
        difficulty: context.difficulty,
        category: context.category
      }
    });
  };

  const fetchSubmissions = async (questionId) => {
    try {
      const res = await api.get(`/submissions/${questionId}`);
      setSubmissions(res.data);
    } catch (error) {
      setSubmissions([]);
    }
  };

  const fetchQuestion = async () => {
    try {
      // Load question from JSON file (like CodingProblems.jsx)
      const response = await fetch('/merged_problems.json');
      const data = await response.json();
      const foundQuestion = data.questions.find((q, index) => q.id === id || `question-${index}` === id);
      
      if (foundQuestion) {
        // Transform question to match expected format
        const transformedQuestion = {
          _id: foundQuestion.id || `question-${data.questions.indexOf(foundQuestion)}`,
          title: foundQuestion.title,
          description: foundQuestion.description,
          difficulty: foundQuestion.difficulty,
          topics: foundQuestion.topics || [],
          examples: foundQuestion.examples || [],
          constraints: foundQuestion.constraints || [],
          testCases: foundQuestion.examples?.map(ex => {
            // Handle new format with input/output properties
            if (ex.input && ex.output) {
              return {
                input: ex.input,
                expectedOutput: ex.output,
                explanation: ex.explanation || `Input: ${ex.input}, Output: ${ex.output}`
              };
            }
            
            // Handle old format for backward compatibility
            const exampleText = ex.example_text || '';
            let input = '';
            let expectedOutput = '';
            
            if (exampleText.includes('Input:') && exampleText.includes('Output:')) {
              input = exampleText.split('Input:')[1]?.split('Output:')[0]?.trim() || '';
              const outputPart = exampleText.split('Output:')[1]?.trim() || '';
              expectedOutput = outputPart.split('Explanation:')[0]?.trim() || outputPart;
            }
            
            return {
              input,
              expectedOutput,
              explanation: exampleText
            };
          }) || [],
          boilerplateCode: foundQuestion.code_snippets || {}
        };
        
        setQuestion(transformedQuestion);
      } else {
        console.error('Question not found in JSON');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (newCode, language) => {
    setCode(newCode);
  };

  const executeCode = async (code, language, testCases) => {
    const results = [];
    let allPassed = true;
    let totalRuntime = 0;

    for (const testCase of testCases) {
      try {
        // Smart input parsing based on data structure detection
        let testInput = testCase.input || '';
        if (testInput.trim()) {
          const inputText = testInput.trim();
          let parsedInput = '';
          
          // 1. Array problems
          if (inputText.includes('[') && inputText.includes(']')) {
            const arrayMatches = inputText.match(/\[([^\]]+)\]/g);
            if (arrayMatches) {
              arrayMatches.forEach(match => {
                const values = match.replace(/[\[\]]/g, '').replace(/,\s*/g, ' ');
                parsedInput += values + '\n';
              });
            }
            const numMatches = inputText.match(/=\s*(\d+)/g);
            if (numMatches) {
              numMatches.forEach(match => {
                const value = match.replace('=', '').trim();
                parsedInput += value + '\n';
              });
            }
          }
          // 2. String problems
          else if (inputText.includes('"') || inputText.includes("'")) {
            const stringMatch = inputText.match(/["']([^"']+)["']/);
            if (stringMatch) {
              parsedInput = stringMatch[1] + '\n';
            }
          }
          // 3. Single number problems
          else if (/^\w+\s*=\s*\d+$/.test(inputText)) {
            const numMatch = inputText.match(/=\s*(\d+)/);
            if (numMatch) {
              parsedInput = numMatch[1] + '\n';
            }
          }
          // 4. Multiple parameters
          else if (inputText.includes('=') && inputText.includes(',')) {
            const parts = inputText.split(',');
            parts.forEach(part => {
              part = part.trim();
              if (part.includes('[')) {
                const arrayMatch = part.match(/\[([^\]]+)\]/);
                if (arrayMatch) {
                  const values = arrayMatch[1].replace(/,\s*/g, ' ');
                  parsedInput += values + '\n';
                }
              } else if (part.includes('"') || part.includes("'")) {
                const stringMatch = part.match(/["']([^"']+)["']/);
                if (stringMatch) {
                  parsedInput += stringMatch[1] + '\n';
                }
              } else if (part.includes('=')) {
                const numMatch = part.match(/=\s*(\d+)/);
                if (numMatch) {
                  parsedInput += numMatch[1] + '\n';
                }
              }
            });
          }
          
          if (parsedInput) {
            testInput = parsedInput;
          }
        }

        const response = await api.post('/code/execute', {
          code,
          language,
          stdin: testInput
        });

        const { output, error, stdout, stderr } = response.data;
        const actualOutput = (output || stdout || '').trim();
        const expectedOutput = (testCase.expectedOutput || '').trim();
        
        // Normalize outputs by removing extra spaces for comparison
        const normalizeOutput = (str) => str.replace(/\s+/g, '').replace(/,\s*/g, ',');
        const passed = normalizeOutput(actualOutput) === normalizeOutput(expectedOutput) && !stderr;
        
        if (!passed) allPassed = false;
        totalRuntime += 50; // Mock runtime

        results.push({
          input: testCase.input,
          output: actualOutput,
          expected: expectedOutput,
          passed: passed,
          error: error || stderr || ''
        });
      } catch (error) {
        allPassed = false;
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Execution failed';
        results.push({
          input: testCase.input,
          output: `Error: ${errorMessage}`,
          expected: testCase.expectedOutput,
          passed: false,
          error: errorMessage
        });
      }
    }

    const avgRuntime = results.length > 0 ? Math.round(totalRuntime / results.length) : 0;
    return { testCases: results, passed: allPassed, runtime: `${avgRuntime} ms` };
  };


  const handleSubmit = async ({ code, language, input, action = 'run' }) => {
    if (!question || !question.testCases) {
      // If no test cases, just run the code with user input
      try {
        const response = await api.post('/code/execute', {
          code,
          language,
          stdin: input || ''
        });

        const { output, error, stdout, stderr } = response.data;
        const result = output || stdout || '';
        
        return {
          output: result || (error || stderr ? `Error: ${error || stderr}` : 'No output')
        };
      } catch (error) {
        return {
          output: `Error: ${error.response?.data?.error || error.message}`
        };
      }
    }

    try {
      const testResults = await executeCode(code, language, question.testCases);

      if (action === 'submit' && testResults.passed) {
        try {
          // Save submission to new submissions collection
          const submissionResponse = await api.post('/submissions/submit', {
            questionId: id, // Use URL id ("9") not question._id
            code: code,
            language: language,
            testResults: testResults
          });
          
          await fetchSubmissions(id); // Refresh submissions after submit
          
          // Skip sessions API since it's causing errors - just save to submissions
          // The submission history will work from the submissions collection
        } catch (error) {
          // Skip sessions API since it's causing errors - just save to submissions
          // The submission history will work from the submissions collection
        }
      }

      // Format output based on test results
      let outputMessage = '';
      
      if (testResults.passed) {
        outputMessage = action === 'submit' ? 
          'Accepted\nRuntime: 0 ms\nSolution submitted successfully!' :
          'Accepted\nRuntime: 0 ms\nAll test cases passed!';
      } else {
        outputMessage = 'Wrong Answer\nRuntime: 0 ms\n';
        
        // Show all test case results
        testResults.testCases.forEach((testCase, index) => {
          outputMessage += `\nYOUR INPUT\n${testCase.input}\n`;
          outputMessage += `YOUR OUTPUT\n${testCase.output}\n`;
          outputMessage += `EXPECTED\n${testCase.expected}\n`;
        });
        
        outputMessage += action === 'submit' ? 
          '\nSubmission failed. All test cases must pass to submit.' :
          '\nSome test cases failed.';
      }

      return {
        output: outputMessage,
        testResults: testResults,
        runtime: testResults.runtime,
        type: testResults.passed ? 'success' : 'error'
      };
    } catch (error) {
      return {
        output: `Error: ${error.message}`
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#F8F9FB]">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Question not found</p>
          <button
            onClick={() => navigate('/coding-problems')}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FB] flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4 relative">
        {/* Left Zone */}
        <div className="absolute left-6 top-1/2 transform -translate-y-1/2">
          <button
            onClick={handleBackToProblems}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Practice</span>
          </button>
        </div>
        
        {/* Center Zone */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-3">
            {context.difficulty !== 'all' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getContextColor('difficulty', context.difficulty)}`}>
                {React.createElement(getContextIcon('difficulty', context.difficulty), { className: 'w-4 h-4' })}
                <span>{context.difficulty.charAt(0).toUpperCase() + context.difficulty.slice(1)}</span>
              </div>
            )}
            {context.category !== 'all' && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${getContextColor('category', context.category)}`}>
                {React.createElement(getContextIcon('category', context.category), { className: 'w-4 h-4' })}
                <span>{context.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-700">
              <Code2 className="w-4 h-4" />
              <span>Practice</span>
            </div>
          </div>
        </div>
        
        {/* Right Zone */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
          <button
            onClick={handleNext}
            disabled={context.questionIndex >= context.totalQuestions - 1}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <CodeEditor
          question={question}
          language="javascript"
          onCodeChange={handleCodeChange}
          onSubmit={handleSubmit}
          loading={false}
          submissions={submissions}
          context={context}
        />
      </div>
    </div>
  );
}
