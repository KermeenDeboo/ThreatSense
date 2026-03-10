from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from datetime import datetime
import joblib

# 1. FIX: Use your actual MongoDB Atlas connection string!
client = MongoClient("mongodb+srv://kermeen:kermeenabc@cluster0.91qw6de.mongodb.net/?appName=Cluster0")
db = client['threatsense']
threats_collection = db['threats']
history_collection = db['history'] 
users_collection = db['users'] 
threat_bp = Blueprint('threat_bp', __name__)

# ... (Keep your existing get_threats, get_threat_stats, add_threat, delete_threat routes here) ...

@threat_bp.route('/get_user_history/<username>', methods=['GET'])
def get_user_history(username):
    try:
        logs = list(history_collection.find({"username": username}, {'_id': 0}).sort("timestamp", -1))
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@threat_bp.route('/admin/users', methods=['GET'])
def get_all_users():
    try:
        # Fetch all users, excluding sensitive password fields
        users = list(users_collection.find({}, {'_id': 0, 'password': 0}))
        return jsonify(users), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@threat_bp.route('/admin/history', methods=['GET'])
def get_all_history():
    try:
        # Fetch the entire scan history across all users, newest first
        history = list(history_collection.find({}, {'_id': 0}).sort("timestamp", -1))
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@threat_bp.route('/predict_live', methods=['POST'])
def predict_live():
    try:
        data = request.json or {}
        # Safely extract username
        username = str(data.get('username', 'Guest_User'))
        
        # Load the AI Brain
        model = joblib.load('backend/models/threat_model.pkl')
        expected_features = model.feature_names_in_
        
        # Calculate fallback value safely
        provided_behavioral = [v for k, v in data.items() if k.startswith('behavioral_')]
        fallback_value = float(sum(provided_behavioral) / len(provided_behavioral)) if provided_behavioral else 0.0
        
        # Pad the input vector
        full_feature_vector = []
        for feature in expected_features:
            val = data.get(feature, fallback_value)
            full_feature_vector.append(float(val)) # Force float
            
        # MAKE PREDICTION & STRICTLY CONVERT DATATYPES
        # If we do not wrap these in int() and float(), MongoDB will throw a 500 error!
        raw_pred = model.predict([full_feature_vector])[0]
        prediction_value = int(raw_pred) 
        
        raw_conf = model.predict_proba([full_feature_vector]).max()
        confidence_value = float(raw_conf)
        
        # Create MongoDB-safe dictionary
        history_entry = {
            "username": username,
            "prediction": "Suspicious Activity" if prediction_value == 1 else "System Safe",
            "confidence": round(confidence_value, 4),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Save to database
        history_collection.insert_one(history_entry)
        
        return jsonify({
            "is_threat": bool(prediction_value == 1),
            "confidence": confidence_value,
            "status": "Success"
        }), 200

    except Exception as e:
        # This will show you exactly what failed if it crashes again
        print(f"\n[CRITICAL DB/AI ERROR]: {str(e)}\n")
        return jsonify({"error": str(e)}), 500