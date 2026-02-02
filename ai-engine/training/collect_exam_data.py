import pandas as pd
import json
import os
from pathlib import Path

def collect_exam_data():
    """
    Collect exam question answers from user input.
    Format: question, answer, expected_score (optional)
    """
    print("=" * 60)
    print("Exam Question Answer Collection Tool")
    print("=" * 60)
    print("\nInstructions:")
    print("1. Enter exam questions and their answers")
    print("2. Optionally provide expected scores (0-100)")
    print("3. Type 'done' when finished")
    print("4. Type 'load' to load from JSON file")
    print("=" * 60)
    
    data = []
    
    # Check if data file exists
    data_file = Path(__file__).parent.parent / 'datasets' / 'exam_data.json'
    if data_file.exists():
        load = input(f"\nFound existing data file. Load it? (y/n): ").lower()
        if load == 'y':
            with open(data_file, 'r', encoding='utf-8') as f:
                existing = json.load(f)
                data.extend(existing)
                print(f"Loaded {len(existing)} existing entries.")
    
    mode_map = {
        '1': 'Technical',
        '2': 'Coding',
        '3': 'Aptitude',
        '4': 'HR',
        '5': 'Reverse',
        '6': 'Cultural',
        '7': 'General'
    }
    
    print("\nQuestion Types:")
    for key, value in mode_map.items():
        print(f"  {key}. {value}")
    
    while True:
        print("\n" + "-" * 60)
        action = input("Enter 'add' to add data, 'done' to finish, 'load' to load JSON: ").lower()
        
        if action == 'done':
            break
        elif action == 'load':
            file_path = input("Enter JSON file path: ").strip()
            if os.path.exists(file_path):
                with open(file_path, 'r', encoding='utf-8') as f:
                    loaded = json.load(f)
                    data.extend(loaded)
                    print(f"Loaded {len(loaded)} entries from file.")
            else:
                print("File not found!")
            continue
        elif action != 'add':
            continue
        
        mode_choice = input("Question type (1-7): ").strip()
        mode = mode_map.get(mode_choice, 'Technical')
        
        question = input("Question: ").strip()
        if not question:
            print("Question cannot be empty!")
            continue
        
        answer = input("Answer: ").strip()
        if not answer:
            print("Answer cannot be empty!")
            continue
        
        expected_score = input("Expected score (0-100, press Enter for auto): ").strip()
        if expected_score:
            try:
                expected_score = float(expected_score)
                if not (0 <= expected_score <= 100):
                    print("Score must be between 0-100. Using auto calculation.")
                    expected_score = None
            except:
                expected_score = None
        else:
            expected_score = None
        
        entry = {
            'mode': mode,
            'question': question,
            'answer': answer,
            'expected_score': expected_score
        }
        
        data.append(entry)
        print(f"✓ Added entry {len(data)}")
    
    # Save to JSON
    os.makedirs(data_file.parent, exist_ok=True)
    with open(data_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved {len(data)} entries to {data_file}")
    return data_file

if __name__ == '__main__':
    collect_exam_data()
