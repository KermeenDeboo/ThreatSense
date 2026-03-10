from flask import Blueprint, request, jsonify
from database import users_collection  # adjust import to match your MongoDB collection

profile_bp = Blueprint('profile_bp', __name__)

# Fetch user profile
@profile_bp.route('/profile/<username>', methods=['GET'])
def get_profile(username):
    user = users_collection.find_one(
        {"username": username},
        {"_id": 0, "password": 0}  # exclude _id and password
    )
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify(user), 200

# Update user profile
@profile_bp.route('/profile/<username>', methods=['PUT'])
def update_profile(username):
    data = request.get_json()
    result = users_collection.update_one({"username": username}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"message": "Profile updated successfully"}), 200