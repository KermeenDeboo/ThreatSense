import psutil
import joblib
import time
from backend.database import log_threat 
from backend.utils.self_healing import trigger_self_healing
import pandas as pd

# 1. Load the 'Brain' (The trained ML Model)
# This model analyzes system logs and network patterns[cite: 55, 65, 87].
try:
    model = joblib.load('backend/models/threat_model.pkl')
except FileNotFoundError:
    print("Error: threat_model.pkl not found. Please run trainer.py first.")

def monitor_system():
    """
    Main loop to continuously scan incoming data and identify 
    suspicious events without manual intervention.
    """
    print("ThreatSense Monitoring Started...")
    while True:
        try:
            # 2. Gather live data (Features: CPU, RAM, Network)
            # Monitoring real-time system activity[cite: 46, 55, 83].
            cpu = psutil.cpu_percent(interval=1)
            mem = psutil.virtual_memory().percent
            # Captures network behavior patterns[cite: 45, 55].
            network_stats = psutil.net_io_counters().bytes_sent / (1024 * 1024) # Convert to MB
            
            # 3. Predict using the ML model[cite: 33, 65, 73].
            # Feature vector matches the trainer.py logic: [cpu, ram, network]
            data_point = [[cpu, mem, network_stats]]
            prediction = model.predict(data_point)[0]
            # Calculating confidence for measurable performance metrics[cite: 50].
            confidence = model.predict_proba(data_point).max()
            
            # 4. Trigger logic if a threat is predicted with 85-90% accuracy.
            if prediction == 1 and confidence >= 0.85:
                handle_threat(confidence)
            
            # Brief pause to manage system resources during continuous monitoring[cite: 46].
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Monitoring Error: {e}")
            break

def handle_threat(score):
    """
    Bridge to the Self-Healing Mechanism[cite: 31, 67].
    Automatically isolates and contains threats within seconds[cite: 47].
    """
    print(f"ALERT: Threat detected with {score*100:.2f}% confidence!")
    
    # Trigger Autonomous Self-Healing[cite: 43, 54, 75].
    # Simulated metadata; in a real scenario, this would come from scapy or logs.
    trigger_self_healing("Anomaly", score, {"ip": "192.168.1.100"})
    
    # Record findings in MongoDB for dashboard visualization.
    log_threat(
        threat_type="Anomaly", 
        confidence=float(score), 
        status="Healed",
        details="Autonomous response triggered due to high-confidence anomaly prediction."
    )

if __name__ == "__main__":
    monitor_system()