import os
from uuid import uuid4
from sqlalchemy import desc
from flask import Blueprint, abort, current_app, jsonify
from werkzeug.utils import secure_filename
from apifairy import authenticate, body, response, other_responses

from api import db
from api.app import cache
from api.models import Artist
from api.schemas import ArtistSchema, DateTimePaginationSchema
from api.decorators import paginated_response
from api.auth import token_auth, role_required
from api.utilities import allowed_file

artists_bp = Blueprint('artists', __name__)

artist_schema = ArtistSchema()
artists_schema = ArtistSchema(many=True)
update_artists_schema = ArtistSchema(partial=True)


@artists_bp.route('/artists', methods=['POST'], strict_slashes=False)
@authenticate(token_auth)
@body(artist_schema, location='form', media_type='multipart/form-data')
@response(artist_schema, 201)
@role_required('admin')
def create_artist(data):
    """Creates new artist"""
    # Extract the file uploads
    print(data)
    artist_image = data.get('image')

    if not artist_image :
        abort(400, description="Artist image is missing")

    # Validate file type and size
    if not allowed_file(artist_image):
        abort(400, description="Invalid mainImage file type.")

    if artist_image.content_length > current_app.config.get('MAX_FILE_SIZE'):
        abort(400, description="Image exceeds size limit.")
    
    # Ensure the storage directory exists
    os.makedirs(current_app.config.get('MEDIA_PATH'), exist_ok=True)

    # Generate file paths
    artist_image_filename = f"{uuid4().hex}_{secure_filename(artist_image.filename)}"
    artist_image_path = os.path.join(current_app.config.get('MEDIA_PATH'), artist_image_filename)
    
    try:
        # Save files to disk
        artist_image.save(artist_image_path)
        # Update file paths in the data dictionary
        data['image'] = artist_image_filename

        artist = Artist(**data)
        db.session.add(artist)
        db.session.commit()
        if cache is not None:
            cache.flush() # Clear the cache. # Clear the cache.
    except IOError as io_err:
        db.session.rollback()
        if os.path.exists(artist_image_path):
            os.remove(artist_image_path)
        return abort(500, f"File I/O error: {str(io_err)}")

    except Exception as e:
        # Cleanup saved files if there is a failure
        print(f"Error: {e}")

        db.session.rollback()
        abort(500, description="An error occurred while processing the request.")

    return artist


@artists_bp.route('/artists', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(artists_schema, order_by=Artist.timestamp,
                    order_direction='desc',
                    pagination_schema=DateTimePaginationSchema)
def get_artists():
    """Retrieve all artists"""
    return db.session.query(Artist) or abort(404)


@artists_bp.route('/artist-names', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
def get_artist_names():
    """Retrieve all artist names"""
    artists = db.session.query(Artist).order_by(desc(Artist.timestamp)).all()
    response = [artist.name for artist in artists]
    return jsonify({
        'artists': response,
    }), 200


@artists_bp.route('/artists/<name>', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@response(artists_schema)
@other_responses({404: 'Products not found'})
def get_artist(name):
    """Retrieve artist by name"""
    return db.session.query(Artist).filter_by(name=name) or abort(404)


@artists_bp.route('/artists/<int:id>', strict_slashes=False, methods=['DELETE'])
@authenticate(token_auth)
@role_required('admin')
@other_responses({403: 'Not allowed to delete the post', 404: 'Products not found'})
def delete_artist(id):
    """Delete an artist"""
    artist = db.session.get(Artist, id)
    db.session.delete(artist)
    db.session.commit()
    if cache is not None:
            cache.flush() # Clear the cache. # Clear the cache.

    return {}, 204