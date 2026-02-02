# Frontend Input/Output Display Guide

## Visual Layout

The CodeEditor component displays results in this format:

```
┌─────────────────────────────────────────────────────────┐
│ Console Tab | Test Cases Tab                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ✅ Accepted                              Runtime: 0 ms   │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ YOUR INPUT                                          │ │
│ │ nums = [2,7,11,15], target = 9                      │ │
│ │                                                     │ │
│ │ YOUR OUTPUT                                         │ │
│ │ [0,1]                                               │ │
│ │                                                     │ │
│ │ EXPECTED                                            │ │
│ │ [0,1]                                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ YOUR INPUT                                          │ │
│ │ nums = [3,2,4], target = 6                          │ │
│ │                                                     │ │
│ │ YOUR OUTPUT                                         │ │
│ │ [1,2]                                               │ │
│ │                                                     │ │
│ │ EXPECTED                                            │ │
│ │ [1,2]                                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ YOUR INPUT                                          │ │
│ │ nums = [3,3], target = 6                            │ │
│ │                                                     │ │
│ │ YOUR OUTPUT                                         │ │
│ │ [0,1]                                               │ │
│ │                                                     │ │
│ │ EXPECTED                                            │ │
│ │ [0,1]                                               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Status Indicators

### ✅ Accepted (All Tests Pass)
- **Icon**: Green checkmark
- **Color**: Green text
- **Message**: "Accepted"
- **Condition**: All test cases output matches expected output

```
✅ Accepted                              Runtime: 0 ms
```

### ❌ Wrong Answer (Some Tests Fail)
- **Icon**: Red X
- **Color**: Red text
- **Message**: "Wrong Answer"
- **Condition**: At least one test case output doesn't match

```
❌ Wrong Answer                          Runtime: 0 ms
```

## Test Case Display

### Each Test Case Shows:

#### 1. YOUR INPUT
```
YOUR INPUT
nums = [2,7,11,15], target = 9
```

#### 2. YOUR OUTPUT
- **Color if Passed**: Green
- **Color if Failed**: Red

```
✅ PASSED:
YOUR OUTPUT
[0,1]

❌ FAILED:
YOUR OUTPUT
[0, 2]
```

#### 3. EXPECTED
- **Always Green**

```
EXPECTED
[0,1]
```

## Color Scheme

```css
/* Status Header */
Success: text-green-500 (#10b981)
Failure: text-red-500 (#ef4444)

/* Output Text */
Passed Output: text-green-400 (#4ade80)
Failed Output: text-red-400 (#f87171)
Expected Output: text-green-400 (#4ade80)
Input Text: text-gray-300 (#d1d5db)

/* Background */
Main: bg-gray-800 (#1f2937)
Dark: bg-gray-900 (#111827)
Darker: bg-gray-950 (#030712)
Border: border-gray-700 (#374151)
```

## Example Scenarios

### Scenario 1: All Tests Pass

```
CODE:
def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i+1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]

RESULT:
✅ Accepted                              Runtime: 0 ms

Test 1:
YOUR INPUT: nums = [2,7,11,15], target = 9
YOUR OUTPUT: [0, 1]  ← Green
EXPECTED: [0,1]

Test 2:
YOUR INPUT: nums = [3,2,4], target = 6
YOUR OUTPUT: [1, 2]  ← Green
EXPECTED: [1,2]

Test 3:
YOUR INPUT: nums = [3,3], target = 6
YOUR OUTPUT: [0, 1]  ← Green
EXPECTED: [0,1]
```

### Scenario 2: Some Tests Fail

```
CODE:
def twoSum(nums, target):
    # Wrong implementation
    return [0, 0]

RESULT:
❌ Wrong Answer                         Runtime: 0 ms

Test 1:
YOUR INPUT: nums = [2,7,11,15], target = 9
YOUR OUTPUT: [0, 0]  ← Red (MISMATCH)
EXPECTED: [0,1]

Test 2:
YOUR INPUT: nums = [3,2,4], target = 6
YOUR OUTPUT: [0, 0]  ← Red (MISMATCH)
EXPECTED: [1,2]

Test 3:
YOUR INPUT: nums = [3,3], target = 6
YOUR OUTPUT: [0, 0]  ← Red (MISMATCH)
EXPECTED: [0,1]
```

### Scenario 3: Execution Error

```
CODE:
def twoSum(nums, target)  # Syntax error - missing colon
    return [0, 1]

RESULT:
❌ Wrong Answer                         Runtime: 0 ms

Test 1:
YOUR INPUT: nums = [2,7,11,15], target = 9
YOUR OUTPUT: Error: SyntaxError: invalid syntax  ← Red
EXPECTED: [0,1]
```

## How It Works - Flow Diagram

```
User Clicks "Run"
        ↓
CodingEditor Page loads test cases
        ↓
For each test case:
        ↓
  Send to backend:
  {
    code: userCode,
    language: selectedLanguage,
    stdin: testCase.input
  }
        ↓
  Backend sends to OneCompiler API
        ↓
  OneCompiler executes and returns stdout/stderr
        ↓
  Compare:
  actual.trim() === expected.trim()
        ↓
  Return result: {passed: true/false, output: ..., expected: ...}
        ↓
Display in CodeEditor component
        ↓
Show status badge (Accepted/Wrong Answer)
Show all test case results with colors
```

## Interactive Elements

### Run Button
- **Disabled When**:
  - Code editor is empty
  - Code is still executing
  - No test cases available
- **Enabled When**: Code written and ready

### Language Selector
- **Functionality**: Changes code editor language + boilerplate code
- **Effect on Compiler**: Parsed input format changes based on language selection

### Reset Button
- **Functionality**: Restores default boilerplate code
- **Effect on Output**: Clears all test results

## Test Results Storage

Each test case result contains:
```javascript
{
  input: "nums = [2,7,11,15], target = 9",
  output: "[0,1]",           // Actual output from compiler
  expected: "[0,1]",         // Expected output from problem
  passed: true               // Comparison result
}
```

## Performance Metrics

- **Runtime**: Shows execution time (0 ms for OneCompiler free tier)
- **All Tests**: Aggregates pass/fail across all test cases

## Browser Console Debugging

When troubleshooting, check browser console for:

```javascript
// In CodeEditor.jsx handleRun()
console.log('Test Results:', testResults);
console.log('Test Passed:', testResults.passed);
console.log('Test Cases:', testResults.testCases.map(tc => ({
  input: tc.input,
  actual: tc.output,
  expected: tc.expected,
  match: tc.passed
})));
```

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Run code (when implemented)
- **Escape**: Close output panel (when implemented)

---

**Status**: ✅ Active in CodeEditor Component
**Last Updated**: January 28, 2026
**Supported Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
