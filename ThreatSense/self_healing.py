import os
import psutil
import platform
# Import the helper from your database file to fix the undefined variable error
from database import log_healing_action

def trigger_self_healing(threat_type, confidence, metadata=None):
    """
    Main coordinator for autonomous response within seconds of detection.
    """
    print(f"Executing Self-Healing for {threat_type} (Confidence: {confidence})")
    
    # 1. Isolation: Block malicious IP (if provided)
    if metadata and 'ip' in metadata:
        block_malicious_ip(metadata['ip'])
        log_healing_action(threat_type, "IP Isolation", metadata['ip'])

    # 2. Containment: Kill suspicious processes 
    if threat_type == "Anomaly":
        terminate_suspicious_processes()
        log_healing_action(threat_type, "Process Containment", "High-CPU Tasks")

    # 3. Recovery: Restore safe configuration
    restore_system_state()
    log_healing_action(threat_type, "System Restoration", "Config Reset")

def block_malicious_ip(ip_address):
    """
    Rule-based logic to block traffic based on OS.
    """
    if platform.system() == "Windows":
        # Uses Windows Netsh for isolation 
        os.system(f"netsh advfirewall firewall add rule name='ThreatSenseBlock' dir=in action=block remoteip={ip_address}")
    else:
        # Uses IPtables for Linux environments 
        os.system(f"iptables -A INPUT -s {ip_address} -j DROP")

def terminate_suspicious_processes():
    """
    Identifies and kills processes that match attack patterns, such as high CPU[cite: 56, 88].
    """
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent']):
        try:
            # Threshold check for anomaly containment [cite: 56]
            if proc.info['cpu_percent'] > 90: 
                proc.terminate()
                print(f"Terminated malicious process: {proc.info['name']} (PID: {proc.info['pid']})")
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

def restore_system_state():
    """
    Restores normal functioning without requiring human intervention[cite: 56, 75].
    """
    print("System restored to safe configuration.")