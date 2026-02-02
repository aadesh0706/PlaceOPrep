import io
import numpy as np
import soundfile as sf
import librosa
from sklearn.ensemble import RandomForestClassifier
import joblib

# Load or initialize lightweight RF on synthetic features
try:
    rf = joblib.load('models/emotion_rf.joblib')
except Exception:
    rf = RandomForestClassifier(n_estimators=50, random_state=42)
    # Train a minimal model on synthetic data
    X = np.random.rand(200, 5)
    y = np.random.choice([0,1,2], size=200)
    rf.fit(X, y)
    joblib.dump(rf, 'models/emotion_rf.joblib')

LABELS = {0: 'Neutral', 1: 'Confident', 2: 'Nervous'}


def extract_features(y, sr):
    # Pitch approximation via librosa.yin
    f0 = librosa.yin(y, fmin=50, fmax=300)
    pitch = float(np.nanmean(f0)) if np.any(~np.isnan(f0)) else 150.0
    # Energy
    energy = float(np.mean(y**2))
    # Speaking rate proxy via zero-crossing
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y)))
    # Pauses via spectral flux variance
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    pause = float(np.std(onset_env))
    # MFCC mean
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfcc_mean = float(np.mean(mfcc))
    return {
        'pitch': pitch,
        'energy': energy,
        'rate': zcr,
        'pause': pause,
        'mfcc': mfcc_mean
    }


def analyze_emotion(wav_bytes: bytes):
    buf = io.BytesIO(wav_bytes)
    y, sr = sf.read(buf)
    if y.ndim > 1:
        y = np.mean(y, axis=1)
    y = y.astype(np.float32)
    features = extract_features(y, sr)
    X = np.array([[features['pitch'], features['energy'], features['rate'], features['pause'], features['mfcc']]])
    proba = rf.predict_proba(X)[0]
    label_idx = int(np.argmax(proba))
    label = LABELS[label_idx]
    confidence = float(np.max(proba))
    return features, label, confidence
