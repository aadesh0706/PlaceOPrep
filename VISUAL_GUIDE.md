# Visual Guide: Compiler Input/Output System

## 🎨 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │  Problem Display │          │   Code Editor    │             │
│  │  - Title         │          │  - Language Sel  │             │
│  │  - Description   │          │  - Code Input    │             │
│  │  - Examples      │          │  - Run Button    │             │
│  │  - Test Cases    │          │  - Reset Button  │             │
│  └──────────────────┘          └──────────────────┘             │
│           ↓                              ↓                       │
│  ┌───────────────────────────────────────────────┐              │
│  │  Test Execution Engine (CodingEditor.jsx)    │              │
│  │  - For each test case:                       │              │
│  │    1. Prepare test input                     │              │
│  │    2. Send code + input to backend           │              │
│  │    3. Receive output from backend            │              │
│  │    4. Compare with expected                  │              │
│  │    5. Store result (passed/failed)           │              │
│  └───────────────────────────────────────────────┘              │
│           ↓                                                      │
│  ┌───────────────────────────────────────────────┐              │
│  │  Result Display (CodeEditor.jsx)             │              │
│  │  - Status Badge (✅/❌)                       │              │
│  │  - Test Cases with Colors                    │              │
│  │  - Input/Output/Expected Display             │              │
│  └───────────────────────────────────────────────┘              │
└────────────┬───────────────────────────────────────────────────┘
             │ HTTP POST
             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
│                                                                  │
│  ┌──────────────────────────────────────────────┐               │
│  │  Code Execution Controller                  │               │
│  │  /api/code/run                              │               │
│  │  - Validate code & language                 │               │
│  │  - Get file extension                       │               │
│  │  - Create request body                      │               │
│  └──────────────────────────────────────────────┘               │
│           ↓ HTTPS POST                                          │
│  ┌──────────────────────────────────────────────┐               │
│  │  OneCompiler API                            │               │
│  │  https://onecompiler-apis.p.rapidapi.com    │               │
│  │  /api/v1/run                                │               │
│  │                                              │               │
│  │  Request Body:                              │               │
│  │  {                                          │               │
│  │    language: "python",                      │               │
│  │    stdin: "test input",                     │               │
│  │    files: [{name, content}]                 │               │
│  │  }                                          │               │
│  └──────────────────────────────────────────────┘               │
│           ↓ Response                                            │
│  ┌──────────────────────────────────────────────┐               │
│  │  Response Transformer                       │               │
│  │  OneCompiler Response:                      │               │
│  │  {stdout, stderr, statusCode}               │               │
│  │           ↓                                 │               │
│  │  Transform to:                              │               │
│  │  {output, stdout, stderr, error, statusCode}│               │
│  └──────────────────────────────────────────────┘               │
│           ↓ HTTP Response                                       │
└──────────────────────┬────────────────────────────────────────┘
                       │
          Returns to Frontend
          (Process repeats for each test case)
```

## 📊 Test Execution Timeline

```
User clicks RUN
       ↓
[Test Case 1] ──→ Backend ──→ OneCompiler ──→ Compare ──→ Result ✓/✗
       ↓
[Test Case 2] ──→ Backend ──→ OneCompiler ──→ Compare ──→ Result ✓/✗
       ↓
[Test Case 3] ──→ Backend ──→ OneCompiler ──→ Compare ──→ Result ✓/✗
       ↓
All complete → Display Accepted/Wrong Answer → Show all results
```

## 🎯 Data Structure Flow

### Step 1: Problem Setup
```
Problem Definition
├── title: "Two Sum"
├── description: "..."
└── testCases: [
    {
      input: "nums = [2,7,11,15], target = 9",
      expectedOutput: "[0,1]",
      explanation: "..."
    },
    { ... },
    { ... }
]
```

### Step 2: User Action
```
Frontend State
├── code: "def twoSum(nums, target):\n    ..."
├── language: "python"
└── testCases: [ { input, expectedOutput, ... } ]
```

### Step 3: Backend Request
```
HTTP POST /api/code/run
Body: {
  code: "def twoSum(nums, target):\n    ...",
  language: "python",
  stdin: "nums = [2,7,11,15], target = 9"
}
```

### Step 4: Backend Processing
```
Backend Processing
├── Validate inputs
├── Map language → file extension
├── Create OneCompiler request
├── Add auth headers
└── Send to OneCompiler
```

### Step 5: OneCompiler Response
```
OneCompiler Response
├── statusCode: 200
├── stdout: "[0, 1]"
└── stderr: ""
```

### Step 6: Backend Transformation
```
Transform Response
├── output: "[0, 1]"        (from stdout)
├── stdout: "[0, 1]"
├── stderr: ""
├── error: ""
└── statusCode: 0
```

### Step 7: Frontend Processing
```
Compare Output
├── actual: "[0, 1]".trim()
├── expected: "[0,1]".trim()
├── match: true ✓
└── Result: {
    input: "nums = [2,7,11,15], target = 9",
    output: "[0, 1]",
    expected: "[0,1]",
    passed: true
}
```

### Step 8: Display
```
Frontend Display
├── Status: ✅ Accepted
├── Runtime: 0 ms
└── Test Case 1:
    ├── YOUR INPUT: nums = [2,7,11,15], target = 9
    ├── YOUR OUTPUT: [0, 1]   (Green)
    └── EXPECTED: [0,1]
```

## 🔄 Input Parsing Flow

```
Raw Input
"nums = [2,7,11,15], target = 9"
    ↓
Split by comma (respect brackets)
├── Part 1: "nums = [2,7,11,15]"
└── Part 2: "target = 9"
    ↓
Language Detection
├── If Python/JS:
│   └── Keep arrays as-is
│       Result: "[2,7,11,15]\n9"
│
├── If Java/C++/C:
│   └── Convert array to space-separated
│       Result: "2 7 11 15\n9"
│
└── Others: Same as Python
```

## 🎨 Output Display Colors

```
┌─────────────────────────────────────────┐
│ Status Header                           │
├─────────────────────────────────────────┤
│ ✅ Accepted          [Green Background] │  ← Success Status
│ Runtime: 0 ms                           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Test Case Results                       │
├─────────────────────────────────────────┤
│ YOUR INPUT (Gray)                       │
│ nums = [2,7,11,15], target = 9 [Gray]  │
│                                         │
│ YOUR OUTPUT (Green if pass)             │
│ [0, 1]                      [Green]     │  ← Passed Test
│                                         │
│ EXPECTED (Green)                        │
│ [0,1]                       [Green]     │
└─────────────────────────────────────────┘

Failed Test Example:
┌─────────────────────────────────────────┐
│ YOUR OUTPUT (Red if fail)               │
│ [0, 2]                      [Red]       │  ← Failed Test
│                                         │
│ EXPECTED (Green)                        │
│ [0,1]                       [Green]     │
└─────────────────────────────────────────┘
```

## 📈 Response Flow Diagram

```
Frontend Request
        ↓
   {"code": "...", "language": "python", "stdin": "..."}
        ↓
Backend Route Handler (/api/code/run)
        ↓
Parse Request Body
        ↓
Validate Inputs
        ↓
Get Language Extension
        ↓
Create OneCompiler Request
        {
          method: "POST",
          headers: {x-rapidapi-key, x-rapidapi-host},
          body: {language, stdin, files: [{name, content}]}
        }
        ↓
Send to OneCompiler API
        ↓
Receive Response
        {statusCode: 200, stdout: "...", stderr: ""}
        ↓
Transform Response
        {
          output: stdout,
          error: stderr,
          stdout: stdout,
          stderr: stderr,
          statusCode: statusCode
        }
        ↓
Send to Frontend
        ↓
Frontend Receives
        ↓
Extract: output, stdout, stderr
        ↓
Compare: output.trim() === expected.trim()
        ↓
Store: {input, output, expected, passed}
        ↓
Display: With appropriate colors and icons
```

## 🎯 Status Determination Logic

```
                    ┌─────────────┐
                    │ Compare All │
                    │  Test Cases │
                    └──────┬──────┘
                           ↓
            ┌──────────────┴──────────────┐
            ↓                             ↓
      All Passed?                    Some Failed?
            ↓                             ↓
      ✅ Accepted                  ❌ Wrong Answer
      (Green Badge)                (Red Badge)
      (Green Outputs)              (Red Outputs)
```

## 📊 Comparison Matrix

```
┌─────────────────────────┬──────────┬──────────────┐
│ Actual Output           │ Expected │ Result       │
├─────────────────────────┼──────────┼──────────────┤
│ "[0, 1]"                │ "[0,1]"  │ ✅ PASS      │
│ "[0,1]"                 │ "[0,1]"  │ ✅ PASS      │
│ "[0, 1]\n"              │ "[0,1]"  │ ✅ PASS*     │
│ "[0, 2]"                │ "[0,1]"  │ ❌ FAIL      │
│ ""                      │ "[0,1]"  │ ❌ FAIL      │
│ "Error: ..."            │ "[0,1]"  │ ❌ FAIL      │
│ "[0,1]"                 │ ""       │ ❌ FAIL      │
├─────────────────────────┼──────────┼──────────────┤
│ * After trim & parse    │          │              │
└─────────────────────────┴──────────┴──────────────┘
```

## 🚀 Performance Timeline

```
0ms     ├─ User clicks Run
        │
100ms   ├─ Frontend prepares request
        │
200ms   ├─ Backend receives request
        │
300ms   ├─ OneCompiler request sent
        │
1000ms  ├─ OneCompiler executes (avg 800ms)
        │
1200ms  ├─ OneCompiler response received
        │
1250ms  ├─ Backend transforms response
        │
1350ms  ├─ Frontend receives response
        │
1400ms  ├─ Frontend compares output
        │
1450ms  ├─ Frontend displays results
        │
1500ms  └─ Complete (Test 1 of 3)
        
        (Repeat for Test 2)
        (Repeat for Test 3)
        
        Total: ~4-5 seconds for 3 tests
```

## 🎓 Decision Tree

```
                    Code Execution Starts
                            ↓
                  ┌─────────────────────┐
                  │ Code Executable?    │
                  └────────┬────────┬───┘
                           │        │
                    No ─────┘        └───── Yes
                           ↓              ↓
                    Syntax Error    Send to OneCompiler
                           ↓              ↓
                    Show Error    ┌─────────────────┐
                                  │ API Returns     │
                                  │ stdout/stderr   │
                                  └────────┬────────┘
                                           ↓
                                  ┌─────────────────┐
                                  │ Compare Output  │
                                  └────────┬────────┘
                                           ↓
                                    ┌──────┴──────┐
                                    │             │
                            Match ──┘             └── No Match
                                    ↓                  ↓
                                 ✅ PASS           ❌ FAIL
```

---

**Visual Diagrams**: Complete
**Clarity**: High
**Understanding**: Easy to follow
