from uuid import uuid4
from flask import session

# Define allowed file extensions for security
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def get_user_id():
    if "user_id" not in session:
        session["user_id"] = f"user_{uuid4().hex[:8]}"
    # return session['user_id']
    return "123"  # temporary
