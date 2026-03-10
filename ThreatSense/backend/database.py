from pymongo import MongoClient
from datetime import datetime

# MongoDB Atlas connection string 
client = MongoClient("mongodb+srv://kermeen:kermeenabc@cluster0.91qw6de.mongodb.net/?appName=Cluster0")

db = client['threatsense']
threats_collection = db['threats']
users_collection = db['users']

def log_threat(threat_type, confidence, status, details=""):
    """
    Saves detection data to MongoDB to support visual reports[cite: 79, 85].
    """
    document = {
        "type": threat_type,
        "confidence": float(confidence),
        "status": status,
        "details": details,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    try:
        result = threats_collection.insert_one(document)
        print(f"Successfully logged threat to MongoDB: {result.inserted_id}")
    except Exception as e:
        print(f"Failed to log threat: {e}")

def log_healing_action(threat_type, action, target):
    """
    Logs specific autonomous defense actions to ensure transparency[cite: 57, 67].
    """
    document = {
        "type": threat_type,
        "action_taken": action,
        "target": target,
        "status": "Healed",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    try:
        threats_collection.insert_one(document)
        print(f"Logged healing action: {action} on {target}")
    except Exception as e:
        print(f"Failed to log healing action: {e}")