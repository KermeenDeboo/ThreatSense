import time
import os
import multiprocessing

def stress_cpu():
    """Simulates a malicious process consuming high CPU resources."""
    print("Simulating High CPU Anomaly...")
    # This creates a heavy load for 10 seconds
    end_time = time.time() + 10
    while time.time() < end_time:
        _ = 1 * 1
    print("CPU Stress Test Complete.")

if __name__ == "__main__":
    print("--- ThreatSense Attack Simulator ---")
    print("1. Starting CPU Stress (Anomaly Simulation)...")
    
    # Start the stress test in a separate process
    p = multiprocessing.Process(target=stress_cpu)
    p.start()

    print("Check your Dashboard now!")
    print("The detection script should identify this spike and trigger self-healing.")
    
    p.join()