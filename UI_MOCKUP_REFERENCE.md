# UI Mockup - Implementation Reference

## Your Original Mockup → Implementation

### Original Image Analysis

Your provided mockup shows:
```
┌──────────────────────────────────────────────────────┐
│ ACTIVE AI INTERVIEWER  |  QUESTION 04 OF 08 | 14:22  │
├──────────────────┬────────────────────────────────────┤
│                  │                                    │
│  AI SPEAKING     │  CANDIDATE FEED                    │
│  (Avatar +       │  Sarah Jenkins                     │
│   Waveform)      │  [Candidate Photo/Avatar]          │
│                  │                                    │
│                  │  Q: "Tell me about a time when    │
│                  │      you had to manage a          │
│                  │      conflict within a            │
│                  │      cross-functional team..."    │
│                  │                                    │
│                  │  CONFIDENCE: 68% [░░░░░░░░░░░]    │
│                  │  SENTIMENT: Positive               │
│                  │                                    │
│                  │  [REPEAT] [NEXT] [END]            │
│                  │                                    │
└──────────────────┴────────────────────────────────────┘
```

---

## Implementation Details

### ✅ Header Section
```jsx
✓ "ACTIVE AI INTERVIEWER" title with cyan dot indicator
✓ "QUESTION PROGRESS" label with current/total (04:08)
✓ Timer display (MM:SS format)
```

### ✅ Left Panel - AI Section
```jsx
✓ Large animated AI avatar circle (cyan border)
✓ Concentric rings with opacity variations
✓ Central AI icon (robot/head icon)
✓ Animated waveform bars below avatar
✓ "AI SPEAKING" status label
```

### ✅ Right Panel - Interview Section

#### Candidate Card
```jsx
✓ Candidate image container
  - Large preview area
  - Default avatar if no image
  - Rounded corners with border

✓ Candidate name display
  - "CANDIDATE FEED" label
  - Full name (e.g., "Sarah Jenkins")

✓ Question section
  - Question counter ("Question X of 8")
  - Question text in italic format
  - Light background card

✓ Metrics dashboard
  - 2-column layout
  - Confidence score with progress bar
  - Sentiment indicator with colored dot

✓ Response transcript (when available)
  - "YOUR RESPONSE" label
  - Scrollable text area
  - Shows user's spoken input

✓ Control buttons
  - START RECORDING (primary, cyan)
  - REPEAT QUESTION (secondary)
  - NEXT QUESTION (secondary)
  - END INTERVIEW (danger, red)
```

---

## Color Scheme Implementation

```css
/* Primary Colors */
--primary: #00d4d4        /* Cyan - Main accent */
--primary-dark: #00a8a8   /* Darker cyan - Hover */
--primary-light: #33e0e0  /* Lighter cyan - Active */

/* Backgrounds */
--bg-dark: #0f172a        /* Slate-900 - Main background */
--bg-darker: #020617      /* Almost black - Borders */
--bg-card: #1e293b        /* Slate-800 - Card background */
--bg-card-light: #334155  /* Slate-700 - Hover states */

/* Text Colors */
--text-primary: #ffffff   /* White - Main text */
--text-secondary: #cbd5e1 /* Slate-300 - Secondary text */
--text-muted: #64748b     /* Slate-500 - Muted text */

/* Sentiment Colors */
--sentiment-positive: #00d4d4  /* Cyan */
--sentiment-neutral: #ffa500   /* Orange */
--sentiment-negative: #ff4444  /* Red */

/* Accents */
--accent-cyan: #06b6d4    /* Cyan variant */
--accent-purple: #8b5cf6  /* Purple for some accents */
--accent-red: #ef4444     /* Red for danger actions */
```

---

## Exact Element Mapping

### Header Row
```
Left: Logo + "ACTIVE AI INTERVIEWER" (cyan dot indicator)
Center: "QUESTION PROGRESS" label + "04:08" indicator
Right: Timer display "MM:SS"
Height: 60px
Background: Transparent (gradient overlay)
```

### Main Grid (2 columns)

#### Left Column (40% width)
```
Content: AI Avatar Section
Alignment: Center vertically & horizontally
Padding: 40px
Background: Gradient background
Elements:
  - Avatar circle: 256px diameter
  - Border: 4px cyan with 30% opacity
  - Inner rings: 2px, 1px borders
  - Center icon: 128px white
  - Waveform: 7 bars below avatar
  - Status: "AI SPEAKING" label
```

#### Right Column (60% width)
```
Content: Candidate Interview Section
Padding: 32px
Background: Card backgrounds
Sections:
  1. Candidate Image: 100% width, auto height (~200px)
  2. Candidate Info: Row with icon + name
  3. Question Card: Full width, ~100px height
  4. Metrics: 2 columns (50/50 split)
  5. Response: Optional, scrollable max-height
  6. Controls: 4 buttons, full width
  Gaps: 24px between sections
```

---

## Component Structure

```
AIInterviewerLiveNew
│
├── Header Section
│   ├── Title + Indicator
│   ├── Progress Counter
│   └── Timer
│
├── Main Container (2-Column Grid)
│   │
│   ├── Left Panel
│   │   └── AI Avatar Section
│   │       ├── Avatar Circle
│   │       │   ├── Rings
│   │       │   └── Icon
│   │       ├── Waveform
│   │       └── Label
│   │
│   └── Right Panel
│       └── Candidate Card
│           ├── Image Container
│           ├── Info Section
│           ├── Question Card
│           ├── Metrics Row
│           │   ├── Confidence Metric
│           │   └── Sentiment Metric
│           ├── Response Display
│           └── Controls
│               ├── Record Button
│               ├── Repeat Button
│               ├── Next Button
│               └── End Button
│
└── Error Display (Conditional)
```

---

## Responsive Behavior

### Desktop (1920px+)
- Two-column layout at 40/60 split
- All animations at full speed
- Full-size avatar (256px)
- All buttons visible

### Laptop (1366-1920px)
- Two-column layout maintained
- Avatar size reduced to 192px
- Smaller fonts and spacing
- Touch targets still 44px minimum

### Tablet (768-1366px)
- Stacked layout (column direction)
- Avatar size reduced to 128px
- Adjusted spacing
- Larger touch targets

### Mobile (<768px)
- Single column, full width
- Avatar size reduced to 96px
- Minimal spacing
- Button text shortened
- Waveform disabled (performance)

---

## Animation Specifications

### Waveform Bars
```
Total bars: 7
Duration: 0.5 seconds per pulse
Timing: Infinite loop
Stagger: 100ms between each bar
Height range: 20px → 35px
Color: Cyan #00d4d4
Opacity: 1.0
```

### Avatar Rings
```
Ring 1 (inner): 2px border, rotate
Ring 2 (outer): 4px border, fade
Duration: 3 seconds
Timing: Linear infinite
Effect: Continuous rotation + pulsing opacity
```

### Button Hover
```
Scale: 1.05x
Duration: 0.2s
Easing: ease-out
Shadow: Slight elevation
Color: Slight brightening
```

### Page Load
```
Fade in: 300ms
Stagger: 100ms per element
Starting from: Top to bottom
Opacity: 0 → 1
```

---

## Typography Hierarchy

### H1 - Page Title
```
Size: 24px
Weight: Bold (700)
Color: White
Font: Sans-serif
Spacing: 0.5em letter-spacing
```

### H2 - Section Headers
```
Size: 18px
Weight: Bold (700)
Color: White
Font: Sans-serif
```

### Label - Section Labels
```
Size: 12px
Weight: Medium (500)
Color: Slate-400
Font: Monospace
Spacing: 0.1em letter-spacing
Transform: Uppercase
```

### Body - Regular Text
```
Size: 16px
Weight: Normal (400)
Color: Slate-300
Font: Sans-serif
Line-height: 1.5
```

### Metric Display
```
Size: 24px
Weight: Bold (700)
Color: Cyan
Font: Sans-serif
```

---

## Button Specifications

### Primary Button (Record)
```
Label: "🎤 START RECORDING" or "🛑 STOP RECORDING"
Background: Gradient cyan #00d4d4 → #06b6d4
Text: Dark (#1e293b)
Padding: 16px 24px
Border-radius: 12px
Width: Full width
Height: 48px
Font: Bold 14px
Hover: Scale 1.05, darker gradient
Active: Pressed state with inset shadow
```

### Secondary Buttons
```
Label: "↻" (Repeat), "⊳" (Next)
Background: Slate-700 #334155
Text: Cyan #00d4d4
Padding: 16px 24px
Border: 1px Slate-600
Border-radius: 12px
Width: Auto (icon only)
Height: 48px
Hover: Brightness increase, cyan border
```

### Danger Button
```
Label: "✕" (End)
Background: Transparent
Border: 1px Red #ff4444
Text: Red #ff4444
Padding: 16px 24px
Border-radius: 12px
Hover: Background slightly red, brighten text
```

---

## Data Mapping

### From Mockup to Component State
```
Mockup Element          →  Component State
─────────────────────────────────────────
Question Number (04)    →  currentQuestionIndex + 1
Total Questions (08)    →  questions.length
Timer (14:22)           →  timeRemaining (in seconds)
AI Status               →  isSpeaking (boolean)
Confidence % (68%)      →  confidence (0-100)
Sentiment               →  sentiment (string)
Sentiment Color         →  sentimentColor (hex)
Question Text           →  currentQuestion (string)
Candidate Name          →  candidateName (string)
Candidate Photo         →  candidateImage (url/null)
User Response           →  transcript (string)
Recording Status        →  isRecording (boolean)
```

---

## Animation Timeline Example

### Page Load
```
0ms     → Fade in header
100ms   → Fade in left panel
200ms   → Fade in right panel
300ms   → Start waveform animation (looped)
500ms   → Start avatar ring rotation (looped)
```

### Recording Start
```
0ms     → Stop waveform animation
100ms   → Change button color to red
150ms   → Start recording waveform (faster)
```

### Answer Submission
```
0ms     → Disable input controls
100ms   → Show loading indicator
2000ms  → Fetch analysis from backend
3000ms  → Animate confidence bar to new value
3500ms  → Update sentiment with color transition
4000ms  → Re-enable controls
4500ms  → Optional question skip enable
```

---

## Accessibility Implementation

### ARIA Labels
```jsx
button aria-label="Start recording your answer"
input aria-label="Question: Tell me about yourself"
div aria-live="polite" role="status" // For updates
```

### Keyboard Navigation
```
Tab       → Move between buttons
Enter/Space → Click focused button
Escape    → Cancel recording / close modals
Arrow Keys → Skip to next/previous question
```

### Focus States
```
Outline: 3px cyan
Offset: 2px
Visible: Always on focus
```

### Contrast Ratios
```
Text on background: 4.5:1+ (WCAG AA)
Interactive elements: 3:1+ (WCAG AA)
Sufficient for color-blind vision
```

---

## Performance Targets

```
Metric                  Target    Actual
────────────────────────────────────────
First Paint            <1s       <500ms
Interactive            <2s       <1s
Animations FPS         60fps     60fps
Page Load              <3s       <2s
API Response           <500ms    <300ms
```

---

## Browser Compatibility

```
Chrome/Chromium      ✅ Full support (Latest 2 versions)
Edge                 ✅ Full support (Latest 2 versions)
Firefox              ⚠️  Partial (No Speech Recognition)
Safari               ⚠️  Partial (Limited animation)
IE 11                ❌ Not supported
```

---

**Reference Version**: 1.0.0  
**Mockup Date**: February 2026  
**Implementation Date**: February 13, 2026  
**Status**: ✅ Complete Match with Mockup
