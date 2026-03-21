import subprocess
import time
import sys

def start_system():
    print("--- Launching ThreatSense System ---")

    # 1. Start the Flask Web Server
    print("[1/3] Starting Web Server (app.py)...")
    server = subprocess.Popen([sys.executable, "app.py"])

    # 2. Start the Threat Detection Monitoring Loop
    print("[2/3] Starting Detection & Prediction Loop...")
    monitor = subprocess.Popen([sys.executable, "-m", "utils.threat_detection"])

    # Give the system a few seconds to initialize
    time.sleep(5)

    # 3. Trigger the Attack Simulation
    print("[3/3] Running Attack Simulator (simulate_attack.py)...")
    attacker = subprocess.Popen([sys.executable, "simulate_attack.py"])

    try:
        print("\nAll systems active. Press Ctrl+C to shut down.")
        # Keep the main script running while the subprocesses work
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down ThreatSense...")
        server.terminate()
        monitor.terminate()
        attacker.terminate()
        print("System Offline.")

if __name__ == "__main__":
    start_system()