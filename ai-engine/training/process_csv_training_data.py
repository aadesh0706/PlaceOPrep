import pandas as pd
import numpy as np
import json
from pathlib import Path
import sys
import os

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))
from nlp_evaluator import evaluate_text, REFERENCE

# Topic to interview type mapping
TOPIC_TO_TYPE = {
    # Technical topics
    'SQL': 'Technical',
    'DSA': 'Technical',
    'C Programming': 'Technical',
    'C++': 'Technical',
    'Trees': 'Technical',
    'Linked List': 'Technical',
    'Algorithms': 'Technical',
    'OS': 'Technical',
    'OOP': 'Technical',
    'DP': 'Technical',
    'Hashing': 'Technical',
    'Sorting': 'Technical',
    'Graphs': 'Technical',
    'Strings': 'Technical',
    'Java': 'Technical',
    'Networking': 'Technical',
    'DBMS': 'Technical',
    'System Design': 'Technical',
    'Technical-C': 'Technical',
    'Technical-C++': 'Technical',
    'Technical-Java': 'Technical',
    'Technical-DBMS': 'Technical',
    'Data Structures': 'Technical',
    'Scheduling': 'Technical',
    'Electronics': 'Technical',
    'Physics': 'Technical',
    'Chemistry': 'Technical',
    'Calculus': 'Technical',
    'Shell': 'Technical',
    'Math': 'Technical',
    'Estimation': 'Technical',
    'Logic': 'Technical',
    
    # Aptitude topics
    'Probability': 'Aptitude',
    'Quantitative Aptitude': 'Aptitude',
    'Logical Reasoning': 'Aptitude',
    'Direction Sense': 'Aptitude',
    'Blood Relation': 'Aptitude',
    'Seating Arrangement': 'Aptitude',
    'Coding-Decoding': 'Aptitude',
    'Analytical Reasoning': 'Aptitude',
    'Permutation': 'Aptitude',
    'Series': 'Aptitude',
    'Combinatorics': 'Aptitude',
    'Maths': 'Aptitude',
    
    # HR/General topics
    'General': 'HR',
    'English Comprehension': 'General',
    'English Vocabulary': 'General',
    'Grammar': 'General',
    'Sentence Improvement': 'General',
    'Inference': 'General',
}

def map_topic_to_type(topic):
    """Map topic to interview type"""
    return TOPIC_TO_TYPE.get(topic, 'Technical')

def generate_reference_answer(question, topic, company):
    """Generate a reference answer based on question, topic, and company"""
    # Use existing reference if available
    mode = map_topic_to_type(topic)
    if mode in REFERENCE:
        return REFERENCE[mode]
    
    # Generate company-specific reference
    if company:
        if 'Amazon' in company:
            return f"A comprehensive answer addressing {topic} concepts relevant to Amazon's technical standards."
        elif 'Google' in company:
            return f"An in-depth explanation of {topic} following Google's engineering best practices."
        elif 'Infosys' in company:
            return f"A clear and structured answer about {topic} suitable for Infosys interview standards."
        elif 'Wipro' in company:
            return f"A detailed response covering {topic} aligned with Wipro's technical requirements."
    
    return f"A well-structured answer explaining {topic} concepts clearly and comprehensively."

def process_csv_file(csv_path, output_file):
    """Process CSV file and generate training data"""
    print(f"Processing {csv_path}...")
    
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found!")
        return []
    
    df = pd.read_csv(csv_path)
    print(f"Loaded {len(df)} rows from {csv_path}")
    
    processed = []
    
    for idx, row in df.iterrows():
        company = str(row.get('company', '')).strip()
        topic = str(row.get('topic', '')).strip()
        question = str(row.get('question', '')).strip()
        answer = str(row.get('answer', '')).strip()
        
        if not question:
            continue
        
        # Map topic to interview type
        interview_type = map_topic_to_type(topic)
        
        # If answer is empty, generate a sample answer for training
        if not answer or answer.lower() in ['nan', 'none', '']:
            # Generate a realistic answer based on topic
            answer = generate_sample_answer(question, topic, company)
        
        # Evaluate the answer
        nlp_scores = evaluate_text(answer, interview_type)
        
        # Get reference answer
        reference = generate_reference_answer(question, topic, company)
        from nlp_evaluator import similarity_score
        similarity = similarity_score(answer, reference) if answer.strip() else 0.0
        
        # Calculate overall score based on quality indicators
        # Good answers should have high relevance, clarity, and similarity
        overall = (nlp_scores.get('relevance', 0.5) * 0.3 + 
                  nlp_scores.get('clarity', 0.5) * 0.3 + 
                  similarity * 0.2 + 
                  nlp_scores.get('grammar', 0.5) * 0.2)
        
        # Adjust score based on answer length (longer answers often better)
        word_count = len(answer.split())
        if word_count > 100:
            overall = min(1.0, overall * 1.1)
        elif word_count < 20:
            overall = max(0.0, overall * 0.8)
        
        processed.append({
            'mode': interview_type,
            'company': company,
            'topic': topic,
            'clarity': nlp_scores.get('clarity', 0.5),
            'grammar': nlp_scores.get('grammar', 0.5),
            'relevance': nlp_scores.get('relevance', 0.5),
            'similarity': similarity,
            'overall': overall,
            'question': question[:100],  # Store first 100 chars for reference
            'answer_length': word_count
        })
    
    print(f"Processed {len(processed)} entries")
    return processed

def generate_sample_answer(question, topic, company):
    """Generate a sample answer based on question, topic, and company"""
    # Topic-specific answer templates
    templates = {
        'SQL': f"To solve this SQL problem, I would use appropriate JOIN operations, WHERE clauses, and aggregate functions. The solution involves understanding the database schema and writing an efficient query that handles edge cases like NULL values.",
        'DSA': f"For this data structure problem, I would analyze the time and space complexity requirements. The optimal approach would involve using appropriate data structures like arrays, linked lists, or trees, depending on the constraints.",
        'OOP': f"Object-Oriented Programming principles apply here. I would explain encapsulation, inheritance, polymorphism, and abstraction with concrete examples relevant to the problem domain.",
        'Algorithms': f"This algorithmic problem requires analyzing the problem constraints and choosing the most efficient approach. I would consider time complexity O(n), space complexity, and edge cases in my solution.",
        'OS': f"Operating system concepts are crucial here. I would explain process management, memory management, scheduling algorithms, or synchronization mechanisms as relevant to the question.",
        'Probability': f"To solve this probability problem, I would identify the sample space, calculate favorable outcomes, and apply probability formulas. The solution involves understanding conditional probability and combinatorics.",
    }
    
    # Get template for topic or use generic
    base_answer = templates.get(topic, f"This {topic} question requires a comprehensive understanding of the concepts. I would approach it systematically, explaining the key principles and providing a clear solution.")
    
    # Add company-specific context
    if company:
        if 'Amazon' in company:
            base_answer += " Following Amazon's engineering principles, I would emphasize scalability and efficiency."
        elif 'Google' in company:
            base_answer += " Aligned with Google's standards, I would focus on clean code and optimal algorithms."
        elif 'Infosys' in company:
            base_answer += " In line with Infosys practices, I would provide a structured and maintainable solution."
        elif 'Wipro' in company:
            base_answer += " Following Wipro's approach, I would ensure the solution is robust and well-documented."
    
    return base_answer

def main():
    """Main processing function"""
    datasets_dir = Path(__file__).parent.parent / 'datasets'
    output_file = datasets_dir / 'answers.csv'
    
    print("=" * 60)
    print("Processing CSV Training Data")
    print("=" * 60)
    
    # Process all CSV files
    csv_files = [
        'skillspectrum_interview_training_dataset.csv',
        'skillspectrum_infosys_wipro_training_dataset.csv'
    ]
    
    all_processed = []
    
    for csv_file in csv_files:
        csv_path = datasets_dir / csv_file
        if csv_path.exists():
            processed = process_csv_file(csv_path, output_file)
            all_processed.extend(processed)
        else:
            print(f"Warning: {csv_file} not found, skipping...")
    
    if not all_processed:
        print("No data processed! Check CSV files.")
        return
    
    # Load existing answers if any
    existing_df = None
    if output_file.exists():
        try:
            existing_df = pd.read_csv(output_file)
            print(f"Found {len(existing_df)} existing training samples")
        except:
            pass
    
    # Create new dataframe
    new_df = pd.DataFrame(all_processed)
    
    # Combine with existing data
    essential_cols = ['mode', 'clarity', 'grammar', 'relevance', 'similarity', 'overall']
    
    if existing_df is not None:
        # Check which columns exist in existing data
        existing_cols = [col for col in essential_cols if col in existing_df.columns]
        new_cols = [col for col in essential_cols if col in new_df.columns]
        
        # Use common columns
        common_cols = list(set(existing_cols) & set(new_cols))
        if 'overall' not in common_cols and 'overall' in new_cols:
            common_cols.append('overall')
        
        if len(common_cols) >= 5:  # Need at least mode + 4 features
            combined_df = pd.concat([
                existing_df[common_cols],
                new_df[common_cols]
            ], ignore_index=True)
        else:
            combined_df = new_df[essential_cols]
    else:
        combined_df = new_df[essential_cols]
    
    # Remove duplicates
    combined_df = combined_df.drop_duplicates(
        subset=['mode', 'clarity', 'grammar', 'relevance', 'similarity'],
        keep='last'
    )
    
    # Save to CSV
    combined_df.to_csv(output_file, index=False)
    
    print(f"\n[OK] Processed {len(all_processed)} new entries")
    print(f"[OK] Total training samples: {len(combined_df)}")
    print(f"[OK] Saved to {output_file}")
    
    # Print statistics
    print("\nStatistics by mode:")
    for mode in combined_df['mode'].unique():
        mode_data = combined_df[combined_df['mode'] == mode]
        print(f"  {mode}: {len(mode_data)} samples")
        print(f"    Avg overall score: {mode_data['overall'].mean():.3f}")
        print(f"    Avg clarity: {mode_data['clarity'].mean():.3f}")
        print(f"    Avg relevance: {mode_data['relevance'].mean():.3f}")
    
    # Save metadata
    metadata = {
        'total_samples': len(combined_df),
        'by_mode': {mode: len(combined_df[combined_df['mode'] == mode]) 
                   for mode in combined_df['mode'].unique()},
        'avg_scores': {
            mode: {
                'overall': float(combined_df[combined_df['mode'] == mode]['overall'].mean()),
                'clarity': float(combined_df[combined_df['mode'] == mode]['clarity'].mean()),
                'relevance': float(combined_df[combined_df['mode'] == mode]['relevance'].mean())
            }
            for mode in combined_df['mode'].unique()
        }
    }
    
    metadata_file = datasets_dir / 'training_metadata.json'
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\n[OK] Saved metadata to {metadata_file}")
    print("\n" + "=" * 60)
    print("Processing complete! Ready for training.")
    print("=" * 60)
    
    return output_file

if __name__ == '__main__':
    main()
