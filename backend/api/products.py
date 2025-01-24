import os
from uuid import uuid4
from flask import Blueprint, abort, current_app, send_from_directory
from werkzeug.utils import secure_filename
from apifairy import authenticate, body, response, other_responses

from api import db
from api.app import cache
from api.limiter import limiter
from api.auth import token_auth, role_required
from api.models import Product, Artist, Cart
from api.schemas import ProductSchema
from api.decorators import paginated_response
from api.schemas import DateTimePaginationSchema
from api.errors import validation_error
from api.utilities import allowed_file

products_bp = Blueprint('products', __name__)
product_schema = ProductSchema()
products_schema = ProductSchema(many=True)
update_product_schema = ProductSchema(partial=True)

@products_bp.route('/media/<path:filename>', methods=['GET'], strict_slashes=False)
def get_image(filename):
    return send_from_directory('../media', filename)

@products_bp.route('/products', methods=['POST'], strict_slashes=False)
@authenticate(token_auth)
@body(product_schema, location='form', media_type='multipart/form-data')
@response(product_schema, 201)
@role_required('admin')
def new_sweater(data):
    """Create a new sweater"""

    # Extract the file uploads
    main_image = data.get('mainImage')
    sub_images = data.get('subImages')

    if not main_image or not sub_images:
        abort(400, description="Missing mainImage or subImages.")

    # Validate file type and size
    if not allowed_file(main_image):
        abort(400, description="Invalid mainImage file type.")
    if main_image.content_length > current_app.config.get('MAX_FILE_SIZE'):
        abort(400, description="Main image exceeds size limit.")

    for img in sub_images:
        if not allowed_file(img):
            abort(400, description=f"Invalid file type for {img.filename}.")
        if img.content_length > current_app.config.get('MAX_FILE_SIZE'):
            abort(400, description=f"File {img.filename} exceeds size limit.")

    # Ensure the storage directory exists
    os.makedirs(current_app.config.get('MEDIA_PATH'), exist_ok=True)

    # Generate file paths
    main_image_filename = f"{uuid4().hex}_{secure_filename(main_image.filename)}"
    main_image_path = os.path.join(current_app.config.get('MEDIA_PATH'), main_image_filename)

    sub_image_filenames = [f"{uuid4().hex}_{secure_filename(img.filename)}" for img in sub_images]
    sub_image_paths = [os.path.join(current_app.config.get('MEDIA_PATH'), img) for img in sub_image_filenames]

    try:
        # Save files to disk
        main_image.save(main_image_path)
        for img, img_path in zip(sub_images, sub_image_paths):
            img.save(img_path)

        # Update file paths in the data dictionary
        data['mainImage'] = main_image_filename
        data['subImages'] = sub_image_filenames
        # data['subImages'] = [os.path.relpath(path, current_app.config.get('MEDIA_PATH')) for path in sub_image_paths]


        # Fetch artist by name
        artist_obj = db.session.query(Artist).filter(Artist.name == data.get('artist_name')).first() if data.get('artist_name') else None

        if not artist_obj:
            return validation_error(404, "Artist not found!")
        data['artist_id'] = artist_obj.id

        # Create product instance
        product = Product(**data)
        db.session.add(product)
        db.session.commit()
        if cache is not None:
            cache.flush()

    except IOError as io_err:
        db.session.rollback()
        if os.path.exists(main_image_path):
            os.remove(main_image_path)
        for img_path in sub_image_paths:
            if os.path.exists(img_path):
                os.remove(img_path)
        return validation_error(500, f"File I/O error: {str(io_err)}")

    except Exception as e:
        # Cleanup saved files if there is a failure
        print(f"Error: {e}")

        db.session.rollback()
        abort(500, description="An error occurred while processing the request.")

    return product


@products_bp.route('/products/<int:id>', methods=['PUT'], strict_slashes=False)
@authenticate(token_auth)
@body(update_product_schema, location='form', media_type='multipart/form-data')
@response(product_schema, 200)
@role_required('admin')
def update_product(data, id):
    """Update an existing product"""

    # Fetch the product by ID
    product = db.session.query(Product).filter_by(id=id).first()
    if not product:
        abort(404, description="Product not found.")

    # Extract the file uploads
    new_main_image = data.get('mainImage')
    new_sub_images = data.get('subImages')

    # Prepare paths for potential new files
    main_image_filename = None
    main_image_path = None
    sub_image_paths = []

    if new_main_image:
        # Validate and generate the path for the new main image
        if not allowed_file(new_main_image):
            abort(400, description="Invalid mainImage file type.")
        if new_main_image.content_length > current_app.config.get('MAX_FILE_SIZE'):
            abort(400, description="Main image exceeds size limit.")
        main_image_filename = f"{uuid4().hex}_{secure_filename(new_main_image.filename)}"
        main_image_path = os.path.join(current_app.config.get('MEDIA_PATH'), main_image_filename)

    if new_sub_images:
        # Validate and generate the paths for new sub-images
        for img in new_sub_images:
            if not allowed_file(img):
                abort(400, description=f"Invalid file type for {img.filename}.")
            if img.content_length > current_app.config.get('MAX_FILE_SIZE'):
                abort(400, description=f"File {img.filename} exceeds size limit.")
            sub_image_paths.append(
                os.path.join(
                    current_app.config.get('MEDIA_PATH'),
                    f"{uuid4().hex}_{secure_filename(img.filename)}"
                )
            )

    try:
        # Ensure the storage directory exists
        os.makedirs(current_app.config.get('MEDIA_PATH'), exist_ok=True)

        # Handle the main image
        if new_main_image:
            # Delete the old main image
            old_main_image_path = os.path.join(current_app.config.get('MEDIA_PATH'), product.mainImage)
            if os.path.exists(old_main_image_path):
                os.remove(old_main_image_path)

            # Save the new main image
            new_main_image.save(main_image_path)
            data['mainImage'] = main_image_filename

        # Handle sub-images
        if new_sub_images:
            # Delete the old sub-images
            old_sub_image_paths = [
                os.path.join(current_app.config.get('MEDIA_PATH'), img) for img in product.subImages
            ]
            for old_path in old_sub_image_paths:
                if os.path.exists(old_path):
                    os.remove(old_path)

            # Save the new sub-images
            for img, img_path in zip(new_sub_images, sub_image_paths):
                img.save(img_path)

            # Update file paths in the data dictionary
            data['subImages'] = [os.path.relpath(path, current_app.config.get('MEDIA_PATH')) for path in sub_image_paths]

        # Commit the updates
        product.update(data)
        db.session.commit()
        if cache is not None:
            cache.flush()

    except IOError as io_err:
        db.session.rollback()
        if main_image_path and os.path.exists(main_image_path):
            os.remove(main_image_path)
        for img_path in sub_image_paths:
            if os.path.exists(img_path):
                os.remove(img_path)
        return validation_error(500, f"File I/O error: {str(io_err)}")

    except Exception as e:
        # Cleanup saved files if there is a failure
        print(f"Error: {e}")
        db.session.rollback()
        abort(500, description="An error occurred while processing the request.")

    return product


@products_bp.route('/sales/<int:id>', methods=['GET'])
@authenticate(token_auth)
@response(product_schema)
@other_responses({404: 'Products not found'})
def get_product(id):
    """Get product sales

    Args:
        id (int): The Id of the product to retrieve

    Returns:
        Product: product with the given id.
    """
    product = db.session.get(Product, id) or abort(404)
    customer_id = token_auth.current_user().id
    user_cart = db.session.query(Cart).filter_by(customer_id=customer_id, product_id=id).first()
    product.quantity_in_cart = user_cart.quantity if user_cart else 0


    return product


@products_bp.route('/products', methods=['GET'])
@limiter.limit("1 per day")
@paginated_response(products_schema, order_by=Product.timestamp,
                    order_direction='desc',
                    pagination_schema=DateTimePaginationSchema)
def all_products():
    """Retrieves all products"""
    return db.session.query(Product)


@products_bp.route('/artists/<name>/products', methods=['GET'])
@authenticate(token_auth)
@paginated_response(products_schema, order_by=Product.timestamp,
                    order_direction='desc',
                    pagination_schema=DateTimePaginationSchema)
@other_responses({404: 'Artist not found'})
def all_user_product(name):
    """Retrieves all products by an artist"""
    artist = db.session.query(Artist).filter(Artist.first_name == name).first() or abort(404)
    return db.session.query(Product).filter(Artist.id == artist.id)


@products_bp.route('/products/<int:id>', methods=['DELETE'])
@authenticate(token_auth)
@role_required('admin')
@other_responses({403: 'Not allowed to delete the post'})
def delete_product(id):
    """Delete an sweater"""
    product = db.session.get(Product, id) or abort(404)
    db.session.delete(product)
    db.session.commit()
    if cache is not None:
        cache.flush()
    return {}, 204