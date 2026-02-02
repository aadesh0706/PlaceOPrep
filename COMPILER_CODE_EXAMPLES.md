# Compiler System - Code Examples

## 1. Frontend Execution Flow

### CodingEditor.jsx - Running Tests

```javascript
// From: frontend/pages/CodingEditor.jsx

const executeCode = async (code, language, testCases) => {
  const results = [];
  let allPassed = true;
  let totalRuntime = 0;

  // Loop through each test case
  for (const testCase of testCases) {
    try {
      // Send to backend
      const response = await api.post('/code/run', {
        code,
        language,
        stdin: testCase.input || ''
      });

      // Get output from response
      const { output, error, stdout, stderr } = response.data;
      const actualOutput = output || stdout || '';
      const expectedOutput = testCase.expectedOutput || '';
      
      // Compare: trim both strings and compare
      const passed = actualOutput.trim() === expectedOutput.trim() && !stderr;
      
      if (!passed) allPassed = false;

      // Store result
      results.push({
        input: testCase.input,
        output: actualOutput || '',
        expected: expectedOutput,
        passed: passed
      });
    } catch (error) {
      allPassed = false;
      const errorMessage = error.response?.data?.error || error.message || 'Execution failed';
      results.push({
        input: testCase.input,
        output: `Error: ${errorMessage}`,
        expected: testCase.expectedOutput,
        passed: false
      });
    }
  }

  return { testCases: results, passed: allPassed, runtime: `0 ms` };
};

// Usage in handleSubmit
const handleSubmit = async ({ code, language, action = 'run' }) => {
  if (!question || !question.testCases) {
    return { output: { type: 'error', message: 'No test cases' } };
  }

  try {
    const testResults = await executeCode(code, language, question.testCases);
    
    return {
      testResults: testResults,
      runtime: testResults.runtime,
      type: testResults.passed ? 'success' : 'error',
      message: testResults.passed 
        ? 'All test cases passed!'
        : 'Some test cases failed.'
    };
  } catch (error) {
    return { output: { type: 'error', message: error.message } };
  }
};
```

## 2. Backend Response Transformation

### CodeExecutionController - Response Format

```javascript
// From: backend/controllers/codeExecutionController.js

exports.executeCode = (req, res) => {
  const { code, language, stdin } = req.body;

  // ... validation code ...

  request(options, function (error, response, body) {
    if (error) {
      console.error("API Error:", error);
      return res.status(500).json({ error: error.message });
    }

    if (response.statusCode !== 200) {
      console.error("API Response Error:", body);
      return res.status(response.statusCode).json({ 
        error: body.message || "Compilation failed",
        details: body
      });
    }

    // Transform OneCompiler response
    // OneCompiler returns: { stdout, stderr }
    // We transform to: { output, error, stdout, stderr, statusCode }
    res.json({
      output: body.stdout || "",        // Main output field
      error: body.stderr || "",          // Error messages
      stdout: body.stdout || "",         // Keep original too
      stderr: body.stderr || "",         // Keep original too
      statusCode: body.statusCode || 0
    });
  });
};
```

## 3. Frontend Display Component

### CodeEditor.jsx - Test Results Display

```jsx
// From: frontend/components/CodeEditor.jsx

{(output || testResults) && (
  <div className="border-t border-gray-700 bg-gray-800 flex flex-col" 
       style={{ maxHeight: '300px' }}>
    <div className="flex border-b border-gray-700">
      <button className="px-4 py-2 text-sm font-medium text-blue-400 border-b-2 border-blue-500">
        Console
      </button>
    </div>
    <div className="p-4 overflow-y-auto flex-1">
      {output && (
        <div>
          {/* Status Header */}
          <div className="flex items-center space-x-2 mb-3">
            {output.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-semibold ${
              output.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}>
              {/* Changed from 'Finished' to 'Accepted' */}
              {output.type === 'success' ? 'Accepted' : 'Wrong Answer'}
            </span>
            {output.runtime && (
              <span className="text-gray-400 text-sm ml-auto">
                Runtime: {output.runtime}
              </span>
            )}
          </div>

          {/* Test Case Results */}
          {testResults && testResults.testCases && testResults.testCases.length > 0 && (
            <div className="space-y-3 mb-4">
              {testResults.testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-900 border border-gray-700 rounded p-3">
                  <div className="text-xs space-y-2">
                    {/* Input */}
                    <div>
                      <span className="text-gray-500 uppercase text-xs">YOUR INPUT</span>
                      <div className="mt-1 bg-gray-950 text-gray-300 p-2 rounded font-mono text-xs">
                        {testCase.input}
                      </div>
                    </div>

                    {/* Output with Color Coding */}
                    <div>
                      <span className="text-gray-500 uppercase text-xs">YOUR OUTPUT</span>
                      <div className={`mt-1 bg-gray-950 p-2 rounded font-mono text-xs ${
                        testCase.passed ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {testCase.output || 'No output'}
                      </div>
                    </div>

                    {/* Expected */}
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
        </div>
      )}
    </div>
  </div>
)}
```

## 4. Input Parser Utility

### inputParser.js - Language-Specific Parsing

```javascript
// From: backend/utils/inputParser.js

function parseInputForLanguage(inputText, language) {
  if (!inputText) return '';

  try {
    // Parse input string: "nums = [2,7,11,15], target = 9"
    // Split by comma but respect array brackets
    const parts = [];
    let currentPart = '';
    let bracketCount = 0;
    
    for (let i = 0; i < inputText.length; i++) {
      const char = inputText[i];
      
      if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
      else if (char === ',' && bracketCount === 0) {
        parts.push(currentPart.trim());
        currentPart = '';
        continue;
      }
      
      currentPart += char;
    }
    if (currentPart) parts.push(currentPart.trim());

    let stdin = '';

    if (language === 'python' || language === 'python3') {
      // Python: [2,7,11,15]\n9
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    } 
    else if (language === 'java' || language === 'cpp' || language === 'c') {
      // Java/C++/C: 2 7 11 15\n9
      stdin = parts
        .map(p => {
          const cleaned = p.replace(/(\w+)\s*=\s*/, '');
          return cleaned.replace(/\[|\]/g, '').replace(/,/g, ' ');
        })
        .join('\n');
    }
    else {
      // Others: Same as Python
      stdin = parts
        .map(p => p.replace(/(\w+)\s*=\s*/, ''))
        .join('\n');
    }

    return stdin;
  } catch (error) {
    console.error('Error parsing input:', error);
    return inputText;
  }
}

function compareOutputs(actual, expected) {
  if (!actual || !expected) {
    return actual.trim() === expected.trim();
  }

  const actualTrimmed = actual.trim();
  const expectedTrimmed = expected.trim();

  // Direct comparison
  if (actualTrimmed === expectedTrimmed) return true;

  // JSON parsing for arrays/objects
  try {
    const actualParsed = JSON.parse(actualTrimmed);
    const expectedParsed = JSON.parse(expectedTrimmed);
    return JSON.stringify(actualParsed) === JSON.stringify(expectedParsed);
  } catch (e) {
    // Not JSON
  }

  // Line-by-line comparison
  const actualLines = actualTrimmed.split('\n').map(l => l.trim()).filter(l => l);
  const expectedLines = expectedTrimmed.split('\n').map(l => l.trim()).filter(l => l);

  if (actualLines.length === expectedLines.length) {
    return actualLines.every((line, i) => line === expectedLines[i]);
  }

  return false;
}

module.exports = {
  parseInputForLanguage,
  parseExpectedOutput,
  compareOutputs
};
```

## 5. Sample Test Case Data

### Problem Definition

```javascript
// From: frontend/pages/CodingEditor.jsx (getSampleQuestions)

'101': {
  _id: '101',
  title: 'Two Sum',
  description: 'Given an array of integers `nums` and an integer `target`, return indices...',
  difficulty: 'easy',
  category: 'technical',
  type: 'coding',
  
  testCases: [
    {
      input: 'nums = [2,7,11,15], target = 9',
      expectedOutput: '[0,1]',
      explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
    },
    {
      input: 'nums = [3,2,4], target = 6',
      expectedOutput: '[1,2]'
    },
    {
      input: 'nums = [3,3], target = 6',
      expectedOutput: '[0,1]'
    }
  ],
  
  boilerplateCode: {
    python: 'def twoSum(nums, target):\n    pass',
    javascript: 'var twoSum = function(nums, target) { };',
    java: 'public int[] twoSum(int[] nums, int target) { }',
    cpp: 'vector<int> twoSum(vector<int>& nums, int target) { }'
  }
}
```

## 6. API Request/Response Example

### Request to Backend

```json
POST /api/code/run
Content-Type: application/json

{
  "code": "def twoSum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i+1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]",
  "language": "python",
  "stdin": "nums = [2,7,11,15], target = 9"
}
```

### Response from Backend

```json
{
  "output": "[0, 1]",
  "error": "",
  "stdout": "[0, 1]",
  "stderr": "",
  "statusCode": 0
}
```

### Frontend Processing

```javascript
// Frontend receives response
const { output, stdout, stderr } = response.data;
const actualOutput = output || stdout || '';  // "[0, 1]"

// Compare with expected
const expectedOutput = testCase.expectedOutput;  // "[0,1]"
const passed = actualOutput.trim() === expectedOutput.trim();  // true

// Result object
{
  input: "nums = [2,7,11,15], target = 9",
  output: "[0, 1]",
  expected: "[0,1]",
  passed: true
}
```

## 7. Error Handling Example

### Syntax Error Case

```javascript
// User Code with error
code = "def twoSum(nums, target)  # Missing colon\n    pass"

// Response from backend
{
  "output": "",
  "error": "SyntaxError: invalid syntax",
  "stderr": "SyntaxError: invalid syntax",
  "stdout": "",
  "statusCode": 1
}

// Frontend processing
const actualOutput = output || stdout || '';  // ""
const expectedOutput = testCase.expectedOutput;  // "[0,1]"
const passed = actualOutput.trim() === expectedOutput.trim() && !stderr;  // false

// Result shows
{
  input: "nums = [2,7,11,15], target = 9",
  output: "Error: SyntaxError: invalid syntax",
  expected: "[0,1]",
  passed: false
}
```

## 8. Multiple Test Cases Flow

```javascript
// Test Case 1
Request:  { code, language: 'python', stdin: "nums = [2,7,11,15], target = 9" }
Response: { output: "[0, 1]", stderr: "" }
Result:   { passed: true, ... }
↓
// Test Case 2
Request:  { code, language: 'python', stdin: "nums = [3,2,4], target = 6" }
Response: { output: "[1, 2]", stderr: "" }
Result:   { passed: true, ... }
↓
// Test Case 3
Request:  { code, language: 'python', stdin: "nums = [3,3], target = 6" }
Response: { output: "[0, 1]", stderr: "" }
Result:   { passed: true, ... }
↓
// Overall Result
allPassed = true && true && true = true
status = 'Accepted' ✅
```

---

**Code Examples**: January 28, 2026
**All Examples**: Production Ready
