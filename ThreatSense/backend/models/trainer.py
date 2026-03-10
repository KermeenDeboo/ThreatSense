import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

def train_threat_model():
    # 1. Create a synthetic dataset with 142 features
    num_samples = 1000
    num_features = 142
    feature_names = ['cpu', 'ram', 'network'] + [f'behavioral_{i}' for i in range(139)]
    
    # USE NORMAL DISTRIBUTION (Bell Curve) to create overlapping data
    # Safe Data: Averages around 30, but can naturally spike higher
    safe_data = np.random.normal(loc=30, scale=15, size=(800, num_features)) 
    
    # Threat Data: Averages around 75, but can naturally drop lower
    threat_data = np.random.normal(loc=75, scale=15, size=(200, num_features))
    
    # Combine and create DataFrame
    X_values = np.vstack([safe_data, threat_data])
    y_values = np.array([0]*800 + [1]*200)
    df = pd.DataFrame(X_values, columns=feature_names)
    # 2. Split data for testing
    X_train, X_test, y_train, y_test = train_test_split(df, y_values, test_size=0.2, random_state=42)

    # 3. Train the Model
    # Increasing n_estimators helps reduce False Positives (Safe data marked as Threat)
    model = RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    # 4. Verify Accuracy
    predictions = model.predict(X_test)
    accuracy = accuracy_score(y_test, predictions)
    print(f"Model Training Complete. Features: {num_features}. Accuracy: {accuracy * 100:.2f}%")

    # 5. Save the Model and the list of feature names
    model.feature_names_in_ = feature_names # Essential for consistent prediction
    save_path = 'backend/models/threat_model.pkl'
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    joblib.dump(model, save_path)

if __name__ == "__main__":
    train_threat_model()