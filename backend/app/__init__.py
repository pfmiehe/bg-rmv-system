from flask import Flask
from flask_cors import CORS
import os
from .routes import main

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}) 
    app.config['CORS_HEADERS'] = 'Content-Type'
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['PROCESSED_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'processed')
    app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg'}

    app.register_blueprint(main)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(app.config['PROCESSED_FOLDER'], exist_ok=True)

    return app
