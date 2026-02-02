import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import api from '../services/api';

export default function CodingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  useEffect(() => {
    if (question?.id || id) {
      fetchSubmissions(id);
    }
  }, [question?.id, id]);

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
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Question not found</p>
          <button
            onClick={() => navigate('/coding-problems')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900">
      <CodeEditor
        question={question}
        language="javascript"
        onCodeChange={handleCodeChange}
        onSubmit={handleSubmit}
        loading={false}
        submissions={submissions}
      />
    </div>
  );
}
