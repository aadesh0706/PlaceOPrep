import joblib
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
import numpy as np
import xgboost as xgb
try:
    dt = joblib.load('models/decision_dt.joblib')
    rf = joblib.load('models/decision_rf.joblib')
except Exception:
    X = np.random.rand(200, 6)
    y = np.random.rand(200)
    dt = DecisionTreeRegressor(max_depth=4).fit(X, y)
    rf = RandomForestRegressor(n_estimators=100, random_state=42).fit(X, y)
    joblib.dump(dt, 'models/decision_dt.joblib')
    joblib.dump(rf, 'models/decision_rf.joblib')
try:
    xgb_model = xgb.Booster()
    xgb_model.load_model('models/decision_xgb.json')
except Exception:
    # Minimal fallback booster
    X = np.random.rand(50, 6)
    y = np.random.rand(50)
    dtrain = xgb.DMatrix(X, label=y)
    params = { 'max_depth': 3, 'eta': 0.2, 'objective': 'reg:squarederror' }
    xgb_model = xgb.train(params, dtrain, num_boost_round=20)
    xgb_model.save_model('models/decision_xgb.json')


def decide_scores(nlp: dict, emotion: dict, mode: str):
    v = np.array([[
        nlp.get('relevance', 0.5),
        nlp.get('similarity', 0.5),
        nlp.get('grammar', 0.5),
        nlp.get('clarity', 0.5),
        emotion.get('confidence', 0.5),
        emotion.get('features', {}).get('rate', 0.1)
    ]])
    s1 = float(dt.predict(v)[0])
    s2 = float(rf.predict(v)[0])
    dx = xgb.DMatrix(v)
    s3 = float(xgb_model.predict(dx)[0])
    # Weighted blend: RF (0.4), DT (0.2), XGB (0.4)
    overall = max(0.0, min(1.0, 0.4*s2 + 0.2*s1 + 0.4*s3))
    return { 'overall': overall, 'dt': s1, 'rf': s2, 'xgb': s3 }
