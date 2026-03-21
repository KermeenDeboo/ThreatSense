threat_schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "type": {"type": "string"},
        "severity": {"type": "string"},
        "timestamp": {"type": "string"},
        "details": {"type": "string"}
    },
    "required": ["name", "type", "severity", "timestamp"]
}