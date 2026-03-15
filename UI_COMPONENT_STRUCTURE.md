# UI Component Structure & Layout

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  ACTIVE AI INTERVIEWER          QUESTION PROGRESS    14:22           │
│  🟢                                04 : 08                           │
├──────────────────────────┬──────────────────────────────────────────┤
│                          │                                          │
│    AI Avatar Circle      │    CANDIDATE FEED                        │
│    (animated rings)      │    ┌────────────────────────────────┐   │
│    + Waveform Bars       │    │  Candidate Image/Photo         │   │
│                          │    │                                │   │
│    ▓░▓░▓▓░▓░▓           │    │  (Default: User avatar)        │   │
│    (animated)            │    └────────────────────────────────┘   │
│                          │                                          │
│    "AI SPEAKING"         │    CANDIDATE INFO                        │
│                          │    🟢 CANDIDATE FEED                     │
│                          │    Sarah Jenkins                         │
│                          │                                          │
│                          │    QUESTION SECTION                      │
│                          │    ┌────────────────────────────────┐   │
│                          │    │Question 1 of 8                 │   │
│                          │    │"Tell me about yourself and     │   │
│                          │    │ your experience..."            │   │
│                          │    └────────────────────────────────┘   │
│                          │                                          │
│                          │    METRICS                               │
│                          │    ┌──────────────┬─────────────────┐   │
│                          │    │ CONFIDENCE   │   SENTIMENT     │   │
│                          │    │ 68%  ▓▓░░░   │   ● Positive    │   │
│                          │    └──────────────┴─────────────────┘   │
│                          │                                          │
│                          │    YOUR RESPONSE                         │
│                          │    ┌────────────────────────────────┐   │
│                          │    │ I have worked in various...    │   │
│                          │    └────────────────────────────────┘   │
│                          │                                          │
│                          │    CONTROLS                              │
│                          │    ┌──────────────────────────────┐    │
│                          │    │  🎤 START RECORDING          │    │
│                          │    ├──────────────────────────────┤    │
│                          │    │ ↻  ⊳  ✕                     │    │
│                          │    └──────────────────────────────┘    │
│                          │                                          │
└──────────────────────────┴──────────────────────────────────────────┘
```

## Component Hierarchy

```
AIInterviewerLiveNew
├── Header
│   ├── Title ("ACTIVE AI INTERVIEWER")
│   ├── Progress Indicator ("04:08")
│   └── Timer ("MM:SS")
│
├── Main Content Container (Grid: 2 columns)
│   │
│   ├── Left Panel (AI Section)
│   │   ├── AI Avatar Circle
│   │   │   ├── Animated Border Rings
│   │   │   ├── AI Icon (center)
│   │   │   └── Animated Waveform Bars (bottom)
│   │   └── Status Label ("AI SPEAKING")
│   │
│   └── Right Panel (Interview Section)
│       ├── Candidate Card
│       │   ├── Candidate Image Container
│       │   │   ├── Uploaded Photo (if available)
│       │   │   └── Default Avatar (fallback)
│       │   ├── Candidate Info
│       │   │   ├── "CANDIDATE FEED" label
│       │   │   └── Candidate Name
│       │   ├── Question Card
│       │   │   ├── Question Number ("Question X of Y")
│       │   │   └── Question Text (italic)
│       │   └── Metrics Row
│       │       ├── Confidence Metric
│       │       │   ├── Percentage Display
│       │       │   └── Progress Bar
│       │       └── Sentiment Metric
│       │           ├── Colored Indicator
│       │           └── Sentiment Text
│       ├── Response Display (conditional)
│       │   ├── Label ("YOUR RESPONSE")
│       │   └── Transcript Text
│       └── Controls Section
│           ├── Primary Button (Recording)
│           │   └── START/STOP with Mic Icon
│           ├── Secondary Button (Repeat)
│           │   └── Rotate Icon
│           ├── Tertiary Button (Next)
│           │   └── Skip Icon
│           └── Danger Button (End)
│               └── X Icon
│
└── Error Display (conditional)
    └── Error Message Box
```

## State Flow

```
┌─────────────────────────────┐
│   Initialize Session        │
│   - Create session          │
│   - Fetch questions         │
│   - Init voice stream       │
└──────────────┬──────────────┘
               │
               ▼
        ┌──────────────────┐
        │  Display Question│
        │  Show Candidate  │
        └────────┬─────────┘
                 │
        ┌────────┴─────────────────┐
        │                          │
        ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│  Ready for Recording │   │  Start Recording     │
│  - Button: RECORD   │   │  - Capture audio    │
│  - Timer: 30s       │   │  - Speech recogn.   │
│  - Metrics: default │   │  - Display waveform │
└──────────────────────┘   └────────┬──────────────┘
        │                           │
        │◄──────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Submitting Answer           │
│  - Stop recording            │
│  - Send to backend           │
│  - Wait for analysis         │
└────────────┬─────────────────┘
             │
             ▼
┌──────────────────────────────┐
│  Display Analysis Results    │
│  - Update confidence         │
│  - Update sentiment          │
│  - Show feedback             │
└────────────┬─────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
┌─────────────┐   ┌──────────────┐
│ Next Ques.  │   │ End Interview│
│ Loop back   │   │ Go to Report │
└─────────────┘   └──────────────┘
```

## CSS Classes & Styling

### Colors
```
Primary: Cyan #00d4d4
Secondary: Dark Slate #1e293b
Background: Gradient slate-900 to slate-800
Accent: Purple/Pink for some elements
Success: Cyan
Warning: Orange #ffa500
Error: Red #ff4444
```

### Typography
```
Headers: 24px, Bold, White
Labels: 12px, Mono, Gray-400
Body: 16px, Regular, Gray-300
Metrics: 24px, Bold, Cyan
```

### Spacing
```
Page Padding: 24px
Grid Gap: 32px
Card Padding: 32px
Element Gap: 16px
```

## Responsive Breakpoints

```
Desktop (Default): 1920px+
  - Two-column layout
  - Full animations
  
Laptop: 1366-1920px
  - Two-column layout
  - Reduced sizes

Tablet: 768-1366px
  - Stacked layout (when needed)
  - Larger touch targets
  
Mobile: <768px
  - Single column
  - Adjusted for touch
  - Reduced animations (performance)
```

## Animation Specifications

### Waveform Animation
```css
.waveform-bar {
  animation: pulse 0.5s ease-in-out infinite;
  animation-delay: calc(${index} * 100ms);
}

@keyframes pulse {
  0%, 100% { height: 20px; }
  50% { height: 35px; }
}
```

### AI Avatar Ring
```css
.avatar-ring {
  animation: spin 3s linear infinite;
  opacity: 0.3;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

### Button Hover
```css
.button:hover {
  transform: scale(1.05);
  transition: all 0.2s ease;
}
```

## Data Flow

### Session Creation
```
Frontend              Backend
   │                    │
   ├─ POST /create     ─>│
   │                    │ Generate questions (Groq)
   │<─ session_id ──────┤
   │<─ questions ───────┤
   │                    │
   └─ Initialize voice  │
```

### Answer Submission
```
Frontend              Backend
   │                    │
   ├─ Stop Recording   │
   │                    │
   ├─ POST /submit     ─>│
   │   answer          │ Evaluate (Groq)
   │                    │ Extract sentiment
   │                    │ Calculate confidence
   │<─ analysis ────────┤
   │<─ sentiment ───────┤
   │<─ confidence ──────┤
   │                    │
   └─ Update Metrics   │
```

### Session End
```
Frontend              Backend
   │                    │
   ├─ POST /end-session->│
   │                    │ Mark complete
   │                    │ Save session
   │<─ success ─────────┤
   │                    │
   └─ Navigate report  │
```

## Browser APIs Used

1. **MediaRecorder API**
   - Record audio from microphone
   - Stop and get audio data

2. **getUserMedia API**
   - Request microphone access
   - Stream audio capture

3. **Web Speech API**
   - Real-time speech recognition
   - Continuous listening
   - Interim results

4. **Fetch/Axios**
   - Send API requests
   - Handle async operations

5. **LocalStorage**
   - Store session state
   - Store user preferences

## Error Handling

```
┌──────────────┐
│  Try Block   │
├──────────────┤
│ Audio Logic  │
│ API Calls    │
│ State Mgmt   │
└────┬─────┬──┘
     │     │
     ▼     ▼
  Success  Error
     │     │
     │     ▼
     │  ┌─────────────────┐
     │  │ Catch Block     │
     │  │ - Log error     │
     │  │ - Set error UI  │
     │  │ - Keep running  │
     │  └─────────────────┘
     │
     └──> Continue App
```

## Performance Optimizations

1. **Lazy Loading**: Components load on-demand
2. **Memoization**: Re-renders minimized with React hooks
3. **Debouncing**: Timer updates debounced
4. **Chunked Audio**: Audio processed in chunks
5. **Conditional Rendering**: Only show relevant UI elements
6. **CSS-in-JS**: Minimal bundle size

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ High contrast colors (WCAG AA)
- ✅ Focus indicators visible
- ✅ Semantic HTML structure
- ✅ Alt text for images

---

**Version**: 1.0.0  
**Last Updated**: February 2026
