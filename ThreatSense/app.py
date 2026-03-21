from flask import Flask, send_from_directory
from flask_cors import CORS
import os
from threat_routes import threat_bp
from auth_routes import auth_bp 
from profile_routes import profile_bp

app = Flask(__name__, 
            static_folder='../frontend', 
            static_url_path='') 

CORS(app, resources={r"/*": {"origins": "*"}})

# Register Blueprints
app.register_blueprint(profile_bp)
app.register_blueprint(threat_bp)
app.register_blueprint(auth_bp)

# Route to serve the main dashboard (index.html)
@app.route('/')
def serve_dashboard():
    """
    Serves the main entry point for the ThreatSense interface.
    """
    return send_from_directory(app.static_folder, 'index.html')

# Route to serve other pages from the pages folder
@app.route('/pages/<path:path>')
def serve_pages(path):
    return send_from_directory(os.path.join(app.static_folder, 'pages'), path)

if __name__ == "__main__":
    # Running the Flask server to display threat insights and system health.
    app.run(debug=True, port=5000)