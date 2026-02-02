import pandas as pd
import json
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path to import nlp_evaluator
sys.path.append(str(Path(__file__).parent.parent))
from nlp_evaluator import evaluate_text, REFERENCE

def process_exam_data():
    """
    Process exam question answers and generate training dataset.
    """
    data_dir = Path(__file__).parent.parent / 'datasets'
    exam_file = data_dir / 'exam_data.json'
    output_file = data_dir / 'answers.csv'
    
    if not exam_file.exists():
        print(f"Error: {exam_file} not found!")
        print("Please run collect_exam_data.py first to collect exam answers.")
        return
    
    with open(exam_file, 'r', encoding='utf-8') as f:
        exam_data = json.load(f)
    
    if not exam_data:
        print("No exam data found!")
        return
    
    print(f"Processing {len(exam_data)} exam entries...")
    
    processed = []
    
    for entry in exam_data:
        mode = entry.get('mode', 'Technical')
        question = entry.get('question', '')
        answer = entry.get('answer', '')
        expected_score = entry.get('expected_score')
        
        if not answer:
            continue
        
        # Evaluate the answer using NLP evaluator
        nlp_scores = evaluate_text(answer, mode)
        
        # Get reference answer for similarity
        reference = REFERENCE.get(mode, '')
        if reference:
            from nlp_evaluator import similarity_score
            similarity = similarity_score(answer, reference)
        else:
            similarity = nlp_scores.get('similarity', 0.5)
        
        # Use expected score if provided, otherwise calculate from NLP scores
        if expected_score is not None:
            overall = expected_score / 100.0
        else:
            overall = nlp_scores.get('overall', 0.5)
        
        processed.append({
            'mode': mode,
            'clarity': nlp_scores.get('clarity', 0.5),
            'grammar': nlp_scores.get('grammar', 0.5),
            'relevance': nlp_scores.get('relevance', 0.5),
            'similarity': similarity,
            'overall': overall
        })
    
    # Load existing answers if any
    existing_df = None
    if output_file.exists():
        existing_df = pd.read_csv(output_file)
        print(f"Found {len(existing_df)} existing training samples")
    
    # Create new dataframe
    new_df = pd.DataFrame(processed)
    
    # Combine with existing data
    if existing_df is not None:
        combined_df = pd.concat([existing_df, new_df], ignore_index=True)
    else:
        combined_df = new_df
    
    # Remove duplicates based on mode, clarity, grammar, relevance, similarity
    combined_df = combined_df.drop_duplicates(
        subset=['mode', 'clarity', 'grammar', 'relevance', 'similarity'],
        keep='last'
    )
    
    # Save to CSV
    combined_df.to_csv(output_file, index=False)
    
    print(f"\n✓ Processed {len(processed)} new entries")
    print(f"✓ Total training samples: {len(combined_df)}")
    print(f"✓ Saved to {output_file}")
    
    # Print statistics
    print("\nStatistics by mode:")
    for mode in combined_df['mode'].unique():
        mode_data = combined_df[combined_df['mode'] == mode]
        print(f"  {mode}: {len(mode_data)} samples")
        print(f"    Avg overall score: {mode_data['overall'].mean():.3f}")
        print(f"    Avg clarity: {mode_data['clarity'].mean():.3f}")
        print(f"    Avg relevance: {mode_data['relevance'].mean():.3f}")
    
    return output_file

if __name__ == '__main__':
    process_exam_data()
