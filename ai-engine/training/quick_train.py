"""
Quick training script that combines all steps.
Run this after collecting exam data to process and train in one go.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def main():
    print("=" * 60)
    print("Quick Training Pipeline")
    print("=" * 60)
    
    # Step 1: Process CSV training data
    print("\n[1/3] Processing CSV training data...")
    try:
        from process_csv_training_data import main as process_csv
        process_csv()
    except Exception as e:
        print(f"Error processing CSV data: {e}")
        import traceback
        traceback.print_exc()
        # Try fallback to exam data processing
        try:
            from process_exam_data import process_exam_data
            print("Trying fallback: processing exam data...")
            process_exam_data()
        except:
            print("Make sure CSV files are in datasets/ folder")
            return
    
    # Step 2: Train models
    print("\n[2/3] Training models...")
    try:
        from train_models import *
        # train_models.py will run when imported
        print("Models trained successfully!")
    except Exception as e:
        print(f"Error training models: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Step 3: Verify models
    print("\n[3/3] Verifying models...")
    import os
    model_dir = Path(__file__).parent.parent / 'models'
    required_models = [
        'decision_dt.joblib',
        'decision_rf.joblib',
        'decision_xgb.json',
        'emotion_rf.joblib'
    ]
    
    all_present = True
    for model_file in required_models:
        model_path = model_dir / model_file
        if model_path.exists():
            print(f"  ✓ {model_file}")
        else:
            print(f"  ✗ {model_file} - MISSING")
            all_present = False
    
    if all_present:
        print("\n" + "=" * 60)
        print("✓ Training complete! All models are ready.")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Restart the AI engine: python app.py")
        print("2. Test with sample answers")
        print("3. Add more exam data for better accuracy")
    else:
        print("\n⚠ Some model files are missing. Check errors above.")

if __name__ == '__main__':
    main()
