from flask import Flask, redirect, url_for, request, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_mail import Mail
from apifairy import APIFairy
from config import Config
from api.redis import Cache
from config import as_bool
import stripe
import os

db = SQLAlchemy()
ma = Marshmallow()
cors = CORS()
mail = Mail()
migrate = Migrate()
apifairy = APIFairy()
cache = None
if as_bool(os.environ.get('USE_CACHE')):
    cache = Cache()


# Stripe secret key and endpoint secret
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

def create_app(config_class=Config):
    """
    Create and configure an instance of the Flask application.

    Args:
        config_class (class): Configuration class to use for the Flask app.

    Returns:
        Flask: Configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)

    if app.config.get('USE_CORS'):
        cors.init_app(app, resources={r"/*": {"origins": "*"}})

    apifairy.init_app(app)

    # Register blueprints
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

    if not cache:
        print("WARNING: Redis caching is disabled for this application!")

    # Define shell context for Flask CLI
    @app.shell_context_processor
    def shell_context():
        """
        Provide context for the Flask shell, including database models.

        Returns:
            dict: Dictionary of database models for CLI access.
        """
        ctx = {'db': db}
        for attr in dir(models):
            model = getattr(models, attr)
            if hasattr(model, '__bases__') and db.Model in getattr(model, '__bases__'):
                ctx[attr] = model
        return ctx

    # Define the index route
    @app.route('/')
    def index():
        """
        Redirect to the API documentation.

        Returns:
            werkzeug.wrappers.Response: Redirect response to API docs.
        """
        return redirect(url_for('apifairy.docs'))

    # Enforce flushing of unflushed request bodies
    @app.after_request
    def after_request(response):
        """
        Ensure Werkzeug flushes any unprocessed request body.

        Args:
            response (Response): The response object.

        Returns:
            Response: The unchanged response object.
        """
        request.get_data()
        return response

    # Define a health check route
    @app.route('/api/health')
    def health_check():
        """
        Provide a health check endpoint.

        Returns:
            Response: JSON response indicating the health status.
        """
        response = make_response({'health': 'Ok'}, 200)
        return response

    return app
