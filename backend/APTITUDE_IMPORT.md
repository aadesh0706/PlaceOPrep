# Aptitude Questions Import Guide

## Overview
This script imports aptitude questions from a CSV file and categorizes them by difficulty (Easy, Medium, Hard). It automatically removes all previous aptitude questions before importing new ones.

## CSV File Location
The script looks for the CSV file at:
- `C:\Users\kunal\Downloads\aptitude_questions.csv`

## CSV Format
The CSV file should have the following columns:
- `Category`: Question category (e.g., Numerical Reasoning, Logical Reasoning, etc.)
- `Question`: The question text
- `OptionA`, `OptionB`, `OptionC`, `OptionD`: Multiple choice options (if applicable)
- `Answer`: The correct answer

## Difficulty Categorization
Questions are automatically categorized based on:
- **Easy (Beginner)**: Short questions (< 30 words, < 200 chars), simple concepts
- **Medium (Intermediate)**: Medium length (30-100 words, 200-500 chars), moderate complexity
- **Hard (Advanced)**: Long questions (> 100 words, > 500 chars) or complex topics with advanced terms

Categories like Spatial Reasoning, Mechanical Reasoning, and Abstract Reasoning may have different thresholds.

## How to Import

1. **Install dependencies** (if not already installed):
   ```bash
   cd backend
   npm install
   ```

2. **Ensure the CSV file is in the Downloads folder** (or update path in `seed_aptitude_from_csv.js`)

3. **Run the import script**:
   ```bash
   node seed_aptitude_from_csv.js
   ```

4. **Verify import**:
   - Check the console output for import statistics
   - Visit the Aptitude page in the frontend to see imported questions

### Example CSV Format
```csv
Category,Question,OptionA,OptionB,OptionC,OptionD,Answer
Numerical Reasoning,What is the value of 15% of 240?,24,30,36,28,36
Logical Reasoning,Which number comes next? 2, 6, 12, 20, 30, ?,36,38,42,46,42
```

## Features
- **Automatic removal** of all previous aptitude questions before import
- **Automatic difficulty detection** based on question complexity
- **MCQ support** with structured options (OptionA-D)
- **Category support** for different aptitude question types
- **Answer validation** with correct answer field

## Notes
- **All previous aptitude questions are deleted** before importing new ones
- Questions are stored with category: 'aptitude'
- Difficulty is mapped: easy→beginner, medium→intermediate, hard→advanced
- Points assigned: Easy=10, Medium=15, Hard=20
- Company tags are not used (questions are generic aptitude questions)
- Questions without options are marked as 'reasoning' type
- Questions with options are marked as 'mcq' type
