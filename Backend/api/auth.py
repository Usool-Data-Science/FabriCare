from flask import current_app, abort
from functools import wraps
from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from werkzeug.exceptions import Unauthorized, Forbidden

from api.app import db
from api.models import User

basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth()


@basic_auth.verify_password
def verify_password(username, password):
    if username and password:
        user = db.session.query(User).filter_by(username=username).first()
        if user is None:
            user = db.session.query(User).filter_by(email=username).first()
        if user and user.verify_password(password):
            return user


@basic_auth.error_handler
def basic_auth_error(status=401):
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code, {'WWW-Authenticate': 'Form'}


@token_auth.verify_token
def verify_token(access_token):
    if current_app.config['DISABLE_AUTH']:
        user = db.session.get(User, 20)
        user.ping()
        return user
    if access_token:
        user = User.verify_access_token(access_token)
        return user
    return None


@token_auth.error_handler
def token_auth_error(status=401):
    error = (Forbidden if status == 403 else Unauthorized)()
    return {
        'code': error.code,
        'message': error.name,
        'description': error.description,
    }, error.code


def role_required(*roles):
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            if token_auth.current_user().role not in roles:
                return abort(403)
            return func(*args, **kwargs)
        return decorated_view
    return wrapper