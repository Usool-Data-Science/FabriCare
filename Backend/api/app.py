from flask import Flask, redirect, url_for, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_mail import Mail
from apifairy import APIFairy
from config import Config
import stripe
import os

db = SQLAlchemy()
ma = Marshmallow()
cors = CORS()
mail = Mail()
migrate = Migrate()
apifairy = APIFairy()
# Stripe secret key and endpoint secret
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

def create_app(config_class=Config):
    """Creates an instance """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize the extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    if app.config['USE_CORS']:
        cors.init_app(app, resources={r"/*": {"origins": "*"}})
    ma.init_app(app)
    apifairy.init_app(app)

    # Blueprints
    from api import models

    from api.errors import errors_bp
    app.register_blueprint(errors_bp)
    
    from api.tokens import tokens
    app.register_blueprint(tokens, url_prefix='/api')
    
    from api.users import users_bp
    app.register_blueprint(users_bp, url_prefix='/api')

    from api.products import products_bp
    app.register_blueprint(products_bp, url_prefix='/api')

    from api.artists import artists_bp
    app.register_blueprint(artists_bp, url_prefix='/api')

    from api.carts import carts_bp
    app.register_blueprint(carts_bp, url_prefix='/api')
    
    from api.orders import orders_bp
    app.register_blueprint(orders_bp, url_prefix='/api')

    

    # define shell context
    @app.shell_context_processor
    def shell_context():
        """Defines all flask CLI arguments"""
        ctx = {'db': db}
        for attr in dir(models):
            model = getattr(models, attr)
            if hasattr(model, '__bases__') and db.Model in getattr(model, '__bases__'):
                ctx[attr] = model
        return ctx

    # Define the index route
    @app.route('/')
    def index():
        return redirect(url_for('apifairy.docs'))
    
    # Define the autoflush function
    @app.after_request
    def after_request(response):
        """Enforce flushing  of Werkzeug unflushed request body"""
        request.get_data()
        return response

    return app

