import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import xgboost as xgb
import joblib
from pathlib import Path
import os

# Change to script directory
script_dir = Path(__file__).parent
os.chdir(script_dir.parent)

print("=" * 60)
print("Training AI Models for PlaceOPrep")
print("=" * 60)

# Train emotion classifier
print("\n1. Training emotion classifier...")
emo_file = 'datasets/emotions.csv'
if not os.path.exists(emo_file):
    print(f"Warning: {emo_file} not found. Generating synthetic data...")
    from generate_datasets import generate_datasets
    generate_datasets()

emo = pd.read_csv(emo_file)
X_emo = emo[['pitch','energy','rate','pause','mfcc']].values
label_map = {'Neutral':0,'Confident':1,'Nervous':2}
y_emo = emo['label'].map(label_map).values

if len(X_emo) < 10:
    print("Warning: Insufficient emotion data. Using minimal model.")
    rf_emo = RandomForestClassifier(n_estimators=50, random_state=42)
else:
    rf_emo = RandomForestClassifier(n_estimators=200, random_state=42)

rf_emo.fit(X_emo, y_emo)
os.makedirs('models', exist_ok=True)
joblib.dump(rf_emo, 'models/emotion_rf.joblib')
print(f"[OK] Emotion model trained on {len(X_emo)} samples")

# Train decision models from answers
print("\n2. Training decision models...")
ans_file = 'datasets/answers.csv'
if not os.path.exists(ans_file):
    print(f"Error: {ans_file} not found!")
    print("Please run process_exam_data.py first to process exam answers.")
    exit(1)

ans = pd.read_csv(ans_file)
print(f"   Loaded {len(ans)} training samples")

if len(ans) < 5:
    print("Warning: Very few training samples. Model may not be accurate.")
    print("Please add more exam question answers for better training.")

# Prepare features
X_ans = ans[['relevance','similarity','grammar','clarity']].values

# Add synthetic emotion confidence and rate features (can be replaced with real data later)
emo_conf = np.clip(np.random.normal(0.7, 0.1, size=X_ans.shape[0]), 0, 1)
emo_rate = np.clip(np.random.normal(0.1, 0.03, size=X_ans.shape[0]), 0, 1)
X_ans = np.hstack([X_ans, emo_conf.reshape(-1,1), emo_rate.reshape(-1,1)])
y_ans = ans['overall'].values

# Split data for validation if we have enough samples
if len(ans) >= 20:
    X_train, X_test, y_train, y_test = train_test_split(
        X_ans, y_ans, test_size=0.2, random_state=42
    )
    print(f"   Training on {len(X_train)} samples, validating on {len(X_test)} samples")
else:
    X_train, y_train = X_ans, y_ans
    X_test, y_test = None, None
    print(f"   Training on all {len(X_train)} samples (no validation split)")

# Decision tree
print("   Training Decision Tree...")
dt = DecisionTreeRegressor(max_depth=5, random_state=42)
dt.fit(X_train, y_train)
if X_test is not None:
    dt_pred = dt.predict(X_test)
    dt_mse = mean_squared_error(y_test, dt_pred)
    dt_r2 = r2_score(y_test, dt_pred)
    print(f"     MSE: {dt_mse:.4f}, R²: {dt_r2:.4f}")
joblib.dump(dt, 'models/decision_dt.joblib')

# Random forest
print("   Training Random Forest...")
n_estimators = min(300, max(50, len(X_train) // 2))
rf = RandomForestRegressor(n_estimators=n_estimators, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)
if X_test is not None:
    rf_pred = rf.predict(X_test)
    rf_mse = mean_squared_error(y_test, rf_pred)
    rf_r2 = r2_score(y_test, rf_pred)
    print(f"     MSE: {rf_mse:.4f}, R²: {rf_r2:.4f}")
joblib.dump(rf, 'models/decision_rf.joblib')

# XGBoost
print("   Training XGBoost...")
dtrain = xgb.DMatrix(X_train, label=y_train)
if X_test is not None:
    dtest = xgb.DMatrix(X_test, label=y_test)
    params = {'max_depth': 5, 'eta': 0.1, 'objective': 'reg:squarederror', 'eval_metric': 'rmse'}
    evals = [(dtrain, 'train'), (dtest, 'test')]
    bst = xgb.train(params, dtrain, num_boost_round=200, evals=evals, verbose_eval=False)
else:
    params = {'max_depth': 5, 'eta': 0.1, 'objective': 'reg:squarederror'}
    bst = xgb.train(params, dtrain, num_boost_round=200)
bst.save_model('models/decision_xgb.json')

print("\n" + "=" * 60)
print("[OK] All models trained and saved successfully!")
print("=" * 60)
print(f"\nModel files saved in: {os.path.abspath('models')}")
print("\nNext steps:")
print("1. Test the models by running the AI engine")
print("2. Add more exam question answers for better accuracy")
print("3. Retrain models when you have more data")
