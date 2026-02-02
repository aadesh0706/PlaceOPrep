import pandas as pd
import numpy as np
from pathlib import Path
import os

def generate_datasets():
    """Generate synthetic datasets for initial training."""
    np.random.seed(42)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    datasets_dir = script_dir.parent / 'datasets'
    os.makedirs(datasets_dir, exist_ok=True)
    
    # Synthetic Q&A dataset
    qs = [
        {'mode':'Technical','question':'Explain polymorphism in OOP.'},
        {'mode':'Coding','question':'Describe logic to reverse a linked list.'},
        {'mode':'Aptitude','question':'Probability of two heads in two tosses?'},
        {'mode':'HR','question':'Tell me about a challenge you overcame.'},
        {'mode':'Reverse','question':'Ask the interviewer about product strategy.'},
        {'mode':'Cultural','question':'Handling diverse team perspectives?'}
    ]
    questions_df = pd.DataFrame(qs)
    questions_df.to_csv(datasets_dir / 'questions.csv', index=False)
    
    answers = []
    for q in qs:
        for i in range(100):
            clarity = np.clip(np.random.normal(0.7, 0.15), 0, 1)
            grammar = np.clip(np.random.normal(0.7, 0.15), 0, 1)
            relevance = np.clip(np.random.normal(0.7, 0.2), 0, 1)
            similarity = np.clip(np.random.normal(0.6, 0.2), 0, 1)
            overall = np.clip((clarity+grammar+relevance+similarity)/4, 0, 1)
            answers.append({ 'mode': q['mode'], 'clarity': clarity, 'grammar': grammar, 'relevance': relevance, 'similarity': similarity, 'overall': overall })
    
    answers_df = pd.DataFrame(answers)
    # Only create if doesn't exist (preserve real training data)
    answers_file = datasets_dir / 'answers.csv'
    if not answers_file.exists():
        answers_df.to_csv(answers_file, index=False)
        print(f'Generated synthetic answers dataset: {len(answers)} samples')
    else:
        print(f'Answers file exists, skipping synthetic generation to preserve real data.')
    
    # Emotion synthetic features
    emotions = []
    for i in range(300):
        label = np.random.choice(['Neutral','Confident','Nervous'])
        pitch = np.random.uniform(100, 220)
        energy = np.random.uniform(0.001, 0.02)
        rate = np.random.uniform(0.02, 0.2)
        pause = np.random.uniform(0.1, 1.0)
        mfcc = np.random.uniform(-100, 100)
        emotions.append({ 'pitch':pitch,'energy':energy,'rate':rate,'pause':pause,'mfcc':mfcc,'label':label })
    
    emotions_df = pd.DataFrame(emotions)
    emotions_df.to_csv(datasets_dir / 'emotions.csv', index=False)
    print(f'Generated synthetic emotions dataset: {len(emotions)} samples')
    print('Synthetic datasets generated.')

if __name__ == '__main__':
    generate_datasets()
