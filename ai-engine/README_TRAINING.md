# AI Engine Training - Quick Start

## Overview

The AI engine evaluates interview answers using machine learning models. To get accurate evaluations, you need to train these models with exam question answers.

## Quick Start (3 Steps)

### 1. Collect Exam Question Answers

```bash
cd ai-engine/training
python collect_exam_data.py
```

Enter your exam questions and answers. You can:
- Type answers manually
- Load from a JSON file
- Add expected scores (optional)

### 2. Process and Train

```bash
python quick_train.py
```

This will:
- Process your exam data
- Train the ML models
- Save models to `models/` directory

### 3. Restart AI Engine

```bash
cd ..
python app.py
```

The AI engine will now use your trained models!

## Example Workflow

```bash
# Step 1: Collect data
python collect_exam_data.py
# Enter questions and answers

# Step 2: Train
python quick_train.py

# Step 3: Use
cd ..
python app.py
```

## Adding More Data

To improve accuracy, add more exam answers:

```bash
python collect_exam_data.py
# Add more questions/answers
python quick_train.py  # Retrain with new data
```

## Data Format

Create a JSON file with your exam data:

```json
[
  {
    "mode": "Technical",
    "question": "Explain polymorphism.",
    "answer": "Polymorphism allows...",
    "expected_score": 85
  }
]
```

Load it: `python collect_exam_data.py` → choose 'load' option

## For More Details

See `TRAINING_GUIDE.md` for comprehensive documentation.
