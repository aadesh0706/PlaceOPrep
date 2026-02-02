# AI Engine Training Setup - Complete

## What Was Done

The AI engine has been enhanced with a complete training pipeline for exam question answers. Here's what was implemented:

### 1. Data Collection System
- **`collect_exam_data.py`**: Interactive script to collect exam questions and answers
- Supports manual entry or loading from JSON files
- Allows specifying expected scores for better training

### 2. Data Processing
- **`process_exam_data.py`**: Processes collected exam data
- Extracts NLP features (relevance, clarity, grammar, similarity)
- Generates training dataset in CSV format

### 3. Model Training
- **`train_models.py`**: Enhanced training script
- Trains Decision Tree, Random Forest, and XGBoost models
- Includes validation metrics and statistics
- Handles small datasets gracefully

### 4. Quick Training Pipeline
- **`quick_train.py`**: One-command training script
- Combines processing and training steps
- Verifies model files after training

### 5. AI Engine Updates
- **`app.py`**: Updated to use trained models
- Integrates with decision_engine, nlp_evaluator, and feedback_engine
- Falls back to basic evaluation if models aren't available
- Fixed port configuration (now uses PORT env var, defaults to 5000)

### 6. Dependencies
- Updated `requirements.txt` with all needed packages:
  - scikit-learn, xgboost, joblib
  - nltk, librosa, soundfile

### 7. Documentation
- **`TRAINING_GUIDE.md`**: Comprehensive training guide
- **`README_TRAINING.md`**: Quick start guide
- Updated main README with training instructions

## How to Use

### Quick Start (After You Share Exam Answers)

1. **Collect Your Exam Answers**:
   ```bash
   cd ai-engine/training
   python collect_exam_data.py
   ```
   - Enter your exam questions and answers
   - Or load from a JSON file

2. **Train the Models**:
   ```bash
   python quick_train.py
   ```
   - This processes your data and trains all models

3. **Restart AI Engine**:
   ```bash
   cd ..
   python app.py
   ```

### Expected Data Format

When you share exam question answers, use this format:

**Option 1: JSON File**
```json
[
  {
    "mode": "Technical",
    "question": "Explain polymorphism in OOP.",
    "answer": "Polymorphism allows objects of different types...",
    "expected_score": 85
  },
  {
    "mode": "HR",
    "question": "Tell me about a challenge you overcame.",
    "answer": "In my previous project, I faced...",
    "expected_score": 80
  }
]
```

**Option 2: Manual Entry**
- Run `collect_exam_data.py`
- Follow the prompts
- Enter questions, answers, and optional scores

### What Happens During Training

1. **Data Processing**:
   - Each answer is evaluated using NLP techniques
   - Features extracted: relevance, clarity, grammar, similarity
   - Overall score calculated (from expected_score or NLP analysis)

2. **Model Training**:
   - Three models trained: Decision Tree, Random Forest, XGBoost
   - Models learn patterns from your exam answers
   - Predictions combined with weighted average

3. **Model Usage**:
   - AI engine uses trained models to evaluate new answers
   - More accurate scores based on your training data
   - Better feedback generation

## File Structure

```
ai-engine/
├── app.py                    # Main AI engine (updated to use models)
├── requirements.txt          # Updated dependencies
├── training/
│   ├── collect_exam_data.py  # Collect exam answers
│   ├── process_exam_data.py  # Process exam data
│   ├── train_models.py       # Train ML models
│   └── quick_train.py        # Quick training pipeline
├── datasets/
│   ├── exam_data.json        # Your collected exam data
│   ├── answers.csv           # Processed training data
│   ├── questions.csv         # Question bank
│   └── emotions.csv          # Emotion training data
├── models/                   # Trained models (generated)
│   ├── decision_dt.joblib
│   ├── decision_rf.joblib
│   ├── decision_xgb.json
│   └── emotion_rf.joblib
├── TRAINING_GUIDE.md         # Comprehensive guide
└── README_TRAINING.md        # Quick start
```

## Next Steps

1. **Share Your Exam Answers**:
   - Create a JSON file with questions and answers
   - Or use the collection script to enter them

2. **Train the Models**:
   - Run the training pipeline
   - Verify models are created

3. **Test the System**:
   - Start the AI engine
   - Submit test answers
   - Check if scores match expectations

4. **Iterate**:
   - Add more exam answers for better accuracy
   - Retrain periodically
   - Fine-tune expected scores

## Tips for Best Results

1. **More Data = Better Accuracy**:
   - Aim for 50-100+ samples per question type
   - Include answers of varying quality

2. **Quality Matters**:
   - Good answers (80-100 score)
   - Average answers (60-79 score)
   - Poor answers (0-59 score)

3. **Coverage**:
   - Include all question types you use
   - Balance distribution across types

4. **Expected Scores**:
   - Provide accurate expected scores
   - Helps models learn correct evaluation

## Troubleshooting

### Models Not Loading
- Check `models/` directory exists
- Verify model files are present
- Run training again if missing

### Low Accuracy
- Add more training data
- Ensure data quality
- Check expected scores are accurate

### Import Errors
- Install dependencies: `pip install -r requirements.txt`
- Check Python version (3.8+)

## Support

For issues:
1. Check `TRAINING_GUIDE.md` for detailed instructions
2. Verify all dependencies are installed
3. Check error messages in console
4. Ensure data files are in correct format

---

**Ready to train!** Share your exam question answers and we'll train the models for accurate evaluation.
