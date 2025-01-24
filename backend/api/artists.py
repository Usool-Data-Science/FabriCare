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
    """
    Create a new artist.

    Args:
        data (dict): The parsed request data containing artist details.

    Returns:
        Artist: The newly created artist object serialized using `artist_schema`.

    Raises:
        400 BadRequest: If the artist image is missing, invalid, or exceeds the size limit.
        500 InternalServerError: If an error occurs while processing the request or saving files.
    """
    # Extract the file uploads
    artist_image = data.get('image')

    if not artist_image:
        abort(400, description="Artist image is missing.")

    # Validate file type and size
    if not allowed_file(artist_image):
        abort(400, description="Invalid artist image file type.")

    if artist_image.content_length > current_app.config.get('MAX_FILE_SIZE'):
        abort(400, description="Artist image exceeds the size limit.")

    # Ensure the storage directory exists
    os.makedirs(current_app.config.get('MEDIA_PATH'), exist_ok=True)

    # Generate a unique file name and file path
    artist_image_filename = f"{uuid4().hex}_{secure_filename(artist_image.filename)}"
    artist_image_path = os.path.join(current_app.config.get('MEDIA_PATH'), artist_image_filename)

    try:
        # Save the uploaded file to disk
        artist_image.save(artist_image_path)

        # Update the file path in the data dictionary
        data['image'] = artist_image_filename

        # Create and save the artist object
        artist = Artist(**data)
        db.session.add(artist)
        db.session.commit()

        # Clear the cache to reflect new data
        if cache is not None:
            cache.flush()

    except IOError as io_err:
        # Handle file I/O errors and clean up
        db.session.rollback()
        if os.path.exists(artist_image_path):
            os.remove(artist_image_path)
        abort(500, description=f"File I/O error: {str(io_err)}")

    except Exception as e:
        # Log the error, clean up, and rollback the transaction
        current_app.logger.error(f"Error creating artist: {e}")
        db.session.rollback()

        # Remove the uploaded file if it exists
        if os.path.exists(artist_image_path):
            os.remove(artist_image_path)

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
    """
    Retrieve all artist names.

    Returns:
        Response: A JSON response containing a list of artist names, 
                  ordered by the most recently added.
    """
    artists = db.session.query(Artist).order_by(desc(Artist.timestamp)).all()
    response = [artist.name for artist in artists]
    return jsonify({'artists': response}), 200


@artists_bp.route('/artists/<name>', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@response(artists_schema)
@other_responses({404: 'Artist not found'})
def get_artist(name):
    """
    Retrieve an artist by name.

    Args:
        name (str): The name of the artist to retrieve.

    Returns:
        Artist: The artist object serialized using `artists_schema`.

    Raises:
        404 NotFound: If the artist with the given name does not exist.
    """
    artist = db.session.query(Artist).filter_by(name=name).first()
    if not artist:
        abort(404, description="Artist not found.")
    return artist


@artists_bp.route('/artists/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
@role_required('admin')
@other_responses({403: 'Not allowed to delete the artist', 404: 'Artist not found'})
def delete_artist(id):
    """
    Delete an artist by ID.

    Args:
        id (int): The ID of the artist to delete.

    Returns:
        dict: An empty dictionary with a 204 status code.

    Raises:
        403 Forbidden: If the user does not have admin privileges.
        404 NotFound: If the artist with the given ID does not exist.
    """
    artist = db.session.get(Artist, id)
    if not artist:
        abort(404, description="Artist not found.")

    db.session.delete(artist)
    db.session.commit()

    # Clear the cache to reflect the deletion
    if cache is not None:
        cache.flush()

    return {}, 204
