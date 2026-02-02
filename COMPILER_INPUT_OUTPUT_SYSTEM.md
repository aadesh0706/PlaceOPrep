# Compiler Input/Output System Documentation

## Overview
The compiler takes inputs from problem examples, formats them according to the selected programming language, executes the code with that input via OneCompiler API, and compares the output against expected results.

## Data Flow

```
Problem Example
    ↓
Input Parser (Language-Specific)
    ↓
Compiler API Request
    ↓
OneCompiler Execution
    ↓
Output Comparison
    ↓
Visual Feedback (Accepted/Wrong Answer)
```

## Input Parsing by Language

### Example Problem Input
```
Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
```

### Language-Specific Parsing

#### Python / Python3
**Format:** Keep arrays/values as-is, one per line
```
Input:  nums = [2,7,11,15], target = 9
Stdin:  [2,7,11,15]
        9
```

#### JavaScript / TypeScript  
**Format:** Keep arrays/values as-is, one per line
```
Input:  nums = [2,7,11,15], target = 9
Stdin:  [2,7,11,15]
        9
```

#### Java / C++ / C# / C
**Format:** Convert arrays to space-separated values, one per line
```
Input:  nums = [2,7,11,15], target = 9
Stdin:  2 7 11 15
        9
```

#### Ruby / Go / Rust / PHP / Swift / Kotlin
**Format:** Remove variable names, keep values as-is
```
Input:  nums = [2,7,11,15], target = 9
Stdin:  [2,7,11,15]
        9
```

## Implementation Files

### Backend

#### `/backend/utils/inputParser.js`
Utility functions for input/output parsing:
- `parseInputForLanguage(inputText, language)` - Converts example input to stdin format
- `parseExpectedOutput(outputText)` - Normalizes expected output
- `compareOutputs(actual, expected)` - Compares outputs with multiple strategies

**Example Usage:**
```javascript
const { parseInputForLanguage } = require('./utils/inputParser');

const input = "nums = [2,7,11,15], target = 9";
const stdin = parseInputForLanguage(input, 'python');
// Result: "[2,7,11,15]\n9"

const stdinJava = parseInputForLanguage(input, 'java');
// Result: "2 7 11 15\n9"
```

#### `/backend/controllers/codeExecutionController.js`
Handles code execution via OneCompiler API:
- Validates code and language
- Creates proper file structure for each language
- Sends request to OneCompiler with stdin
- Transforms response (stdout → output, stderr → error)

**Request Format:**
```json
{
  "code": "def twoSum(nums, target):\n    return [0, 1]",
  "language": "python",
  "stdin": "[2,7,11,15]\n9"
}
```

**Response Format:**
```json
{
  "output": "[0, 1]",
  "stdout": "[0, 1]",
  "stderr": "",
  "error": "",
  "statusCode": 0
}
```

### Frontend

#### `/frontend/pages/CodingEditor.jsx`
Main coding page that:
- Fetches sample questions with test cases
- Calls `executeCode()` for each test case
- Sends code + parsed input to backend
- Compares each result with expected output
- Displays pass/fail status

**Test Case Format:**
```javascript
{
  input: "nums = [2,7,11,15], target = 9",
  expectedOutput: "[0,1]",
  explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
}
```

**Execution Logic:**
```javascript
const executeCode = async (code, language, testCases) => {
  const results = [];
  
  for (const testCase of testCases) {
    // Send to backend
    const response = await api.post('/code/run', {
      code,
      language,
      stdin: testCase.input  // Raw input, frontend doesn't parse
    });
    
    // Compare output
    const passed = response.data.output.trim() === 
                   testCase.expectedOutput.trim();
    
    results.push({
      input: testCase.input,
      output: response.data.output,
      expected: testCase.expectedOutput,
      passed: passed
    });
  }
  
  return results;
};
```

#### `/frontend/components/CodeEditor.jsx`
Code editor component that displays:
- **Console Output Section** shows:
  - Status: ✅ Accepted or ❌ Wrong Answer
  - Test cases with Your Input/Your Output/Expected comparison
  - Syntax highlighting for output
  - Green text for passed, red text for failed

## Output Comparison Strategy

The system compares outputs with multiple fallbacks:

1. **Direct String Comparison** (trimmed)
   ```javascript
   actual.trim() === expected.trim()
   ```

2. **JSON Parsing** (for arrays/objects)
   ```javascript
   JSON.stringify(JSON.parse(actual)) === JSON.stringify(JSON.parse(expected))
   ```

3. **Line-by-Line Comparison** (for multi-line output)
   ```javascript
   actualLines[i] === expectedLines[i]
   ```

## Example Workflow

### User Code
```python
class Solution(object):
    def twoSum(self, nums, target):
        for i in range(len(nums)):
            for j in range(i+1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
```

### Test Case 1
```
Input:  nums = [2,7,11,15], target = 9
Expected: [0,1]
```

### Execution Steps
1. **Parse Input** (Backend logic):
   - Frontend sends: `stdin: "nums = [2,7,11,15], target = 9"`
   - Backend receives in `/code/run` endpoint
   - Parser converts for Python: `"[2,7,11,15]\n9"`

2. **Execute Code**:
   - OneCompiler runs Python code with stdin
   - Code reads input and processes
   - Returns stdout: `[0, 1]`

3. **Compare Output**:
   ```javascript
   actual: "[0, 1]"
   expected: "[0,1]"
   match: true (after trim and parsing)
   ```

4. **Display Result**:
   ```
   ✅ Accepted
   
   YOUR INPUT: nums = [2,7,11,15], target = 9
   YOUR OUTPUT: [0, 1]  (green text)
   EXPECTED: [0,1]
   ```

## Configuration

### Supported Languages
```javascript
const LANGUAGE_EXTENSIONS = {
  python: "index.py",
  python3: "index.py",
  javascript: "index.js",
  typescript: "index.ts",
  java: "Solution.java",
  cpp: "main.cpp",
  c: "index.c",
  csharp: "Solution.cs",
  ruby: "index.rb",
  go: "index.go",
  rust: "index.rs",
  php: "index.php",
  swift: "index.swift",
  kotlin: "Solution.kt"
};
```

### OneCompiler API Configuration
```javascript
// File: .env
ONECOMPILER_API_KEY=your_api_key_here

// API Endpoint
https://onecompiler-apis.p.rapidapi.com/api/v1/run

// Request Headers
{
  "x-rapidapi-key": process.env.ONECOMPILER_API_KEY,
  "x-rapidapi-host": "onecompiler-apis.p.rapidapi.com",
  "Content-Type": "application/json"
}
```

## Error Handling

### Execution Errors
```json
{
  "error": "Syntax error on line 2",
  "stderr": "SyntaxError: ...",
  "output": "",
  "stdout": ""
}
```

### Output Mismatch
```
❌ Wrong Answer

YOUR INPUT: nums = [2,7,11,15], target = 9
YOUR OUTPUT: [0, 2]  (red text - incorrect)
EXPECTED: [0,1]
```

### No Output
```
❌ Wrong Answer

YOUR INPUT: nums = [2,7,11,15], target = 9
YOUR OUTPUT: (no output generated)
EXPECTED: [0,1]
```

## Testing

### Manual Test Cases
You can add test cases directly to sample questions:

```javascript
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
]
```

### Debug Output
Enable logging in browser console:
```javascript
console.log('Test Case:', testCase);
console.log('Response:', response.data);
console.log('Comparison:', {
  actual: response.data.output.trim(),
  expected: testCase.expectedOutput.trim(),
  match: response.data.output.trim() === testCase.expectedOutput.trim()
});
```

## Future Enhancements

1. **Custom Input Format**
   - Allow users to define custom input parsing
   - Support for file uploads
   - Interactive input dialog

2. **Output Comparison Options**
   - Regex-based matching
   - Tolerance for floating-point numbers
   - Case-insensitive comparison

3. **Performance Tracking**
   - Runtime comparison
   - Memory usage tracking
   - Performance benchmarks

4. **Advanced Features**
   - Time limit enforcement
   - Memory limit enforcement
   - Multiple execution runs
   - Input/output streaming

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** January 28, 2026
