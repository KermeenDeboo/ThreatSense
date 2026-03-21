from flask import Blueprint, request, jsonify
from database import users_collection
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin

auth_bp = Blueprint('auth_bp', __name__)

# ---------------- REGISTER ----------------
@auth_bp.route('/register', methods=['POST'])
@cross_origin()  # <-- Add this
def register():
    data = request.json
    existing_user = users_collection.find_one({"username": data['username']})
    if existing_user:
        return jsonify({"message": "Username already exists"}), 400

    hashed_password = generate_password_hash(data['password'])
    user = {
        "name": data.get("name"),
        "email": data.get("email"),
        "city": data.get("city"),
        "gender": data.get("gender"),
        "avatar": data.get("avatar"),
        "username": data["username"],
        "password": hashed_password,
        "role": "user"  
    }
    users_collection.insert_one(user)
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user = users_collection.find_one({"username": data['username']})
    if user and check_password_hash(user['password'], data['password']):
        return jsonify({
            "message": "Login successful",
            "username": user["username"],
            "avatar": user.get("avatar"),
            "role": user.get("role", "user")  # <-- role included
        }), 200
    return jsonify({"message": "Invalid credentials"}), 401