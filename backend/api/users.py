from apifairy.decorators import other_responses
from flask import Blueprint, abort
from apifairy import authenticate, body, response

from api import db
from api.app import cache
from api.models import User
from api.schemas import UserSchema, UpdateUserSchema, DateTimePaginationSchema
from api.auth import token_auth, role_required
from api.decorators import paginated_response

users_bp = Blueprint('users', __name__)
user_schema = UserSchema()
users_schema = UserSchema(many=True)
update_user_schema = UpdateUserSchema(partial=True)


@users_bp.route('/users', methods=['POST'], strict_slashes=False)
@body(user_schema)
@response(user_schema, 201)
def new(args):
    """Register a new user"""
    user = User(**args)
    db.session.add(user)
    db.session.commit()
    cache.flush() # Clear the cache.
    return user


@users_bp.route('/users', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(users_schema, order_by=User.timestamp,
                    order_direction='desc',
                    pagination_schema=DateTimePaginationSchema)
def all():
    """Retrieve all users"""
    return db.session.query(User).filter(User.role != 'admin')


@users_bp.route('/users/<int:id>', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@response(user_schema)
@other_responses({404: 'User not found'})
def get(id):
    """Retrieve a user by id"""
    return db.session.get(User, id) or abort(404)


@users_bp.route('/users/<username>', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@response(user_schema)
@other_responses({404: 'User not found'})
def get_by_username(username):
    """Retrieve a user by username"""
    return db.session.query(User).filter_by(username=username).one() or \
        abort(404)


@users_bp.route('/me', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@response(user_schema)
def me():
    """Retrieve the authenticated user"""
    me = token_auth.current_user()
    return me


@users_bp.route('/me', methods=['PUT'], strict_slashes=False)
@authenticate(token_auth)
@body(update_user_schema)
@response(user_schema)
def put(data):
    """Edit user information"""
    user = token_auth.current_user()
    if 'password' in data and ('old_password' not in data or
                               not user.verify_password(data['old_password'])):
        abort(400)
    user.update(data)
    db.session.commit()
    cache.flush() # Clear the cache.
    return user


@users_bp.route('/users/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
@role_required('admin')
def delete_user(id):
    """Delete user"""
    user = db.session.get(User, id)
    db.session.delete(user)
    db.session.commit()
    cache.flush() # Clear the cache.
    return {}