from flask import current_app, abort
from functools import wraps
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from werkzeug.exceptions import Unauthorized, Forbidden

from api.app import db
from api.models import User

# Initialize authentication handlers
basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@basic_auth.verify_password
def verify_password(username, password):
    """
    Verify the user's credentials using basic authentication.

    Args:
        username (str): The username or email of the user.
        password (str): The user's password.

    Returns:
        User: The authenticated user object, or None if authentication fails.
    """
    if username and password:
        user = db.session.query(User).filter_by(username=username).first()
        if user is None:
            user = db.session.query(User).filter_by(email=username).first()
        if user and user.verify_password(password):
            return user
    return None


@basic_auth.error_handler
def basic_auth_error(status=401):
    """
    Handle errors during basic authentication.

    Args:
        status (int, optional): The HTTP status code. Defaults to 401.

    Returns:
        dict: JSON response with error details.
        int: HTTP status code.
        dict: Headers specifying the authentication method.
    """
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code, {'WWW-Authenticate': 'Form'}


@token_auth.verify_token
def verify_token(access_token):
    """
    Verify the user's token for authentication.

    Args:
        access_token (str): The access token provided by the user.

    Returns:
        User: The authenticated user object, or None if token verification fails.
    """
    if current_app.config.get('DISABLE_AUTH'):
        # When authentication is disabled, return a default user (e.g., admin).
        user = db.session.get(User, 20)
        if user:
            user.ping()
        return user
    if access_token:
        user = User.verify_access_token(access_token)
        return user
    return None


@token_auth.error_handler
def token_auth_error(status=401):
    """
    Handle errors during token authentication.

    Args:
        status (int, optional): The HTTP status code. Defaults to 401.

    Returns:
        dict: JSON response with error details.
        int: HTTP status code.
    """
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code


def role_required(*roles):
    """
    Decorator to restrict access to users with specific roles.

    Args:
        *roles (tuple): A list of roles allowed to access the decorated function.

    Returns:
        function: The decorated function.

    Raises:
        403 Forbidden: If the current user's role is not in the allowed roles.
    """
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            if token_auth.current_user().role not in roles:
                abort(403, description="You do not have permission to perform this action.")
            return func(*args, **kwargs)
        return decorated_view
    return wrapper
