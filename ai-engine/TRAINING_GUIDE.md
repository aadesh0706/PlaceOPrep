# AI Engine Training Guide

This guide explains how to train the AI engine with exam question answers to improve evaluation accuracy.

## Overview

The AI engine uses machine learning models to evaluate interview answers. To improve accuracy, you need to train these models with real exam question answers.

## Training Pipeline

1. **Collect Exam Data** - Gather questions and answers
2. **Process Data** - Extract features from answers
3. **Train Models** - Train ML models on processed data
4. **Use Models** - AI engine uses trained models for evaluation

## Step-by-Step Instructions

### Step 1: Collect Exam Question Answers

Run the data collection script:

```bash
cd ai-engine/training
python collect_exam_data.py
```

This will:
- Prompt you to enter exam questions and answers
- Allow you to specify question types (Technical, Coding, HR, Aptitude, etc.)
- Optionally accept expected scores
- Save data to `datasets/exam_data.json`

**Example Input:**
```
Question type: 1 (Technical)
Question: Explain polymorphism in OOP.
Answer: Polymorphism allows objects of different types to be treated uniformly through a common interface. There are two types: compile-time (method overloading) and runtime (method overriding).
Expected score: 85
```

**Alternative: Load from JSON**

You can also create a JSON file with your exam data:

```json
[
  {
    "mode": "Technical",
    "question": "Explain polymorphism in OOP.",
    "answer": "Polymorphism allows...",
    "expected_score": 85
  },
  {
    "mode": "HR",
    "question": "Tell me about a challenge you overcame.",
    "answer": "In my previous project...",
    "expected_score": 80
  }
]
```

Then load it using the script's 'load' option.

### Step 2: Process Exam Data

Process the collected data to extract features:

```bash
python process_exam_data.py
```

This will:
- Evaluate each answer using NLP techniques
- Extract features: relevance, similarity, grammar, clarity
- Calculate overall scores
- Save to `datasets/answers.csv` for training

### Step 3: Train Models

Train the ML models:

```bash
python train_models.py
```

This will:
- Load training data from `datasets/answers.csv`
- Train three models:
  - Decision Tree
  - Random Forest
  - XGBoost
- Save trained models to `models/` directory
- Show training statistics and validation metrics

**Note:** More training data = better accuracy. Aim for at least 50-100 samples per question type.

### Step 4: Restart AI Engine

After training, restart the AI engine to use the new models:

```bash
cd ai-engine
python app.py
```

## Data Format

### Exam Data JSON Format

```json
{
  "mode": "Technical|Coding|HR|Aptitude|General|Reverse|Cultural",
  "question": "The interview question",
  "answer": "The candidate's answer",
  "expected_score": 85  // Optional: 0-100
}
```

### Training Data CSV Format

The processed data (`datasets/answers.csv`) contains:

- `mode`: Question type
- `clarity`: Answer clarity score (0-1)
- `grammar`: Grammar score (0-1)
- `relevance`: Relevance to question (0-1)
- `similarity`: Similarity to reference answer (0-1)
- `overall`: Overall score (0-1)

## Model Architecture

### Decision Models

Three models are trained and their predictions are combined:

1. **Decision Tree** (20% weight)
2. **Random Forest** (40% weight)
3. **XGBoost** (40% weight)

Final score = weighted average of all three models

### Features Used

- Relevance: How relevant the answer is to the question
- Similarity: How similar to reference answers
- Grammar: Grammar and punctuation quality
- Clarity: Answer clarity and structure
- Emotion confidence: Confidence level (synthetic, can be replaced with real audio analysis)
- Speaking rate: Rate of speech (synthetic, can be replaced with real audio analysis)

## Improving Accuracy

### Add More Training Data

- Collect answers from real interviews
- Include answers of varying quality (good, average, poor)
- Cover all question types you use
- Aim for balanced distribution across types

### Quality Guidelines

- **Good answers**: Clear, relevant, well-structured (score 80-100)
- **Average answers**: Adequate but could improve (score 60-79)
- **Poor answers**: Unclear, irrelevant, or poorly structured (score 0-59)

### Retraining

Retrain models periodically as you collect more data:

```bash
# Add new exam data
python collect_exam_data.py

# Process new data
python process_exam_data.py

# Retrain models
python train_models.py
```

## Troubleshooting

### "No training data found"

Run `collect_exam_data.py` first to collect exam answers.

### "Insufficient training samples"

Add more exam question answers. More data = better accuracy.

### Models not loading

Check that model files exist in `models/`:
- `decision_dt.joblib`
- `decision_rf.joblib`
- `decision_xgb.json`
- `emotion_rf.joblib`

### Low accuracy

- Add more training data
- Ensure data quality (good mix of answer qualities)
- Check that expected scores are accurate
- Retrain with more diverse examples

## Quick Start Example

```bash
# 1. Collect some exam answers
cd ai-engine/training
python collect_exam_data.py
# Enter a few questions and answers

# 2. Process the data
python process_exam_data.py

# 3. Train models
python train_models.py

# 4. Restart AI engine
cd ..
python app.py
```

## Next Steps

After training:

1. Test the AI engine with sample answers
2. Compare scores with your expectations
3. Collect more data for better accuracy
4. Fine-tune expected scores based on results
5. Retrain periodically with new data

## Support

For issues or questions:
1. Check that all dependencies are installed: `pip install -r requirements.txt`
2. Verify data files exist in `datasets/`
3. Check model files exist in `models/`
4. Review error messages in console output
