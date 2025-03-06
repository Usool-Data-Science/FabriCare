from marshmallow import validate, validates, validates_schema, \
    ValidationError, post_dump, pre_load
from apifairy.fields import FileField
from api import ma, db
from api.auth import token_auth
from api.models import User, Artist, Product, Order, Cart

paginated_schema_cache = {}


class EmptySchema(ma.Schema):
    pass


class DateTimePaginationSchema(ma.Schema):
    class Meta:
        ordered = True

    limit = ma.Integer()
    offset = ma.Integer()
    after = ma.DateTime(load_only=True)
    count = ma.Integer(dump_only=True)
    total = ma.Integer(dump_only=True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if data.get('offset') is not None and data.get('after') is not None:
            raise ValidationError('Cannot specify both offset and after')


class StringPaginationSchema(ma.Schema):
    class Meta:
        ordered = True

    limit = ma.Integer()
    offset = ma.Integer()
    after = ma.String(load_only=True)
    count = ma.Integer(dump_only=True)
    total = ma.Integer(dump_only=True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if data.get('offset') is not None and data.get('after') is not None:
            raise ValidationError('Cannot specify both offset and after')


def PaginatedCollection(schema, pagination_schema=StringPaginationSchema):
    if schema in paginated_schema_cache:
        return paginated_schema_cache[schema]

    class PaginatedSchema(ma.Schema):
        class Meta:
            ordered = True

        pagination = ma.Nested(pagination_schema)
        data = ma.Nested(schema, many=True)
        extra_data = ma.Dict()
        source = ma.String()

    PaginatedSchema.__name__ = 'Paginated{}'.format(schema.__class__.__name__)
    paginated_schema_cache[schema] = PaginatedSchema
    return PaginatedSchema


class CartSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Cart
        include_fk = True
        ordered = True

    id = ma.auto_field(dump_only=True)
    quantity = ma.auto_field(required=True)
    size = ma.auto_field(required=True)
    total_price = ma.Integer(dump_only=True)
    timestamp = ma.auto_field(dump_only=True)
    # Nested relationships
    product = ma.Nested(
        lambda: ProductSchema(only=('id', 'quantity', 'title', 'price', 'subImages')),
        dump_only=True
    )
    customer = ma.Nested(
        lambda: UserSchema(only=('id', 'username')),
        dump_only=True
    )

    @validates('quantity')
    def validate_quantity(self, value):
        if value < 1:
            raise ValidationError("Quantity must be at least 1.")
        if value > 1000:
            raise ValidationError("Quantity cannot exceed 1000.")
        return value


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        ordered = True

    id = ma.auto_field(dump_only=True)  # Id is read-only
    url = ma.String(dump_only=True)
    cart_size = ma.Integer(dump_only=True)
    first_name = ma.String(required=True)
    last_name = ma.String(required=True)
    avatar = ma.String()
    username = ma.auto_field(required=True)
    email = ma.auto_field(required=True)
    password = ma.String(required=True, load_only=True)
    role = ma.String()

    @validates('first_name')
    def validate_first_name(self, value):
        if not (3 <= len(value) <= 50):
            raise ValidationError("First name must be between 3 and 50 characters long.")
        if not value.isalpha():
            raise ValidationError("First name must contain only letters.")
        return value

    @validates('last_name')
    def validate_last_name(self, value):
        if not (3 <= len(value) <= 50):
            raise ValidationError("Last name must be between 3 and 50 characters long.")
        if not value.isalpha():
            raise ValidationError("Last name must contain only letters.")
        return value

    @validates('avatar')
    def validate_avatar(self, value):
        if value and not validate.URL()(value):
            raise ValidationError("Avatar must be a valid URL.")
        return value

    @validates('username')
    def validate_username(self, value):
        if not value[0].isalpha():
            raise ValidationError("Username must start with a letter.")
        if len(value) > 64:
            raise ValidationError("Username must not exceed 64 characters.")
        user = token_auth.current_user()
        old_username = user.username if user else None
        if value != old_username and db.session.query(User).filter_by(username=value).first():
            raise ValidationError("This username has been taken, try another!")
        return value

    @validates('email')
    def validate_email(self, value):
        if len(value) > 120:
            raise ValidationError("Email must not exceed 120 characters.")
        if not validate.Email()(value):
            raise ValidationError("Invalid email format.")
        user = token_auth.current_user()
        old_email = user.email if user else None
        if value != old_email and db.session.query(User).filter_by(email=value).first():
            raise ValidationError("This email has been taken, try another!")
        return value

    @validates('password')
    def validate_password(self, value):
        if len(value) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not any(char.isalpha() for char in value):
            raise ValidationError("Password must include at least one letter.")
        if not any(char.isdigit() for char in value):
            raise ValidationError("Password must include at least one number.")
        if not any(char in "@$!%*?&#" for char in value):
            raise ValidationError("Password must include at least one special character (@$!%*?&#).")
        return value

    @validates('role')
    def validate_role(self, value):
        if value not in ["admin", "user", "guest"]:
            raise ValidationError("Role must be one of 'admin', 'user', or 'guest'.")
        return value

    @post_dump
    def fix_datetimes(self, data, **kwargs):
        if 'first_seen' in data:
            data['first_seen'] += 'Z'
        if 'last_seen' in data:
            data['last_seen'] += 'Z'
        return data


class UpdateUserSchema(UserSchema):
    old_password = ma.String(load_only=True, validate=validate.Length(min=3))

    @validates('old_password')
    def validate_old_password(self, value):
        if not token_auth.current_user().verify_password(value):
            raise ValidationError('Password is incorrect')


class ArtistSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Artist
        ordered = True

    id = ma.auto_field(dump_only=True)
    name = ma.String(required=True)
    image = ma.Raw(type='file')
    description = ma.String(required=True)
    website = ma.String(required=True)

    @validates('name')
    def validate_name(self, value):
        if not value.strip():
            raise ValidationError("Name cannot be empty.")
        if db.session.query(Artist).filter(Artist.name == value).first():
            raise ValidationError("This artist has already been registered!")
        if len(value) > 120:
            raise ValidationError("Name must not exceed 120 characters.")
        return value

    @validates('image')
    def validate_image(self, value):
        if not value or not hasattr(value, 'filename'):
            raise ValidationError("A valid image file is required.")
        if not value.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            raise ValidationError("Only PNG, JPG, JPEG, or GIF files are allowed.")
        if hasattr(value, 'content_length') and value.content_length > 2 * 1024 * 1024:  # 2MB limit
            raise ValidationError("Image file size must not exceed 2MB.")
        return value

    @validates('description')
    def validate_description(self, value):
        if not value.strip():
            raise ValidationError("Description cannot be empty.")
        if len(value) < 10:
            raise ValidationError("Description must be at least 10 characters long.")
        if len(value) > 1000:
            raise ValidationError("Description must not exceed 1000 characters.")
        return value

    @validates('website')
    def validate_website(self, value):
        if not value.strip():
            raise ValidationError("Website cannot be empty.")
        if not (10 <= len(value) <= 500):
            raise ValidationError("Website must be between 10 and 500 characters long.")
        if not (value.startswith("http://") or value.startswith("https://") or value.startswith("www.")):
            raise ValidationError("Website must start with 'http://', 'https://', or 'www.'.")
        return value


class ProductSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Product
        include_fk = True
        ordered = True

    id = ma.Integer(dump_only=True)
    title = ma.auto_field(required=True)
    deadline = ma.auto_field(required=True)
    days_left = ma.Integer(dump_only=True)
    expire = ma.auto_field(dump_only=True)
    goal = ma.auto_field(required=True)
    price = ma.auto_field(required=True)
    artist_name = ma.String(required=True)
    artist_details = ma.String(dump_only=True)
    artist_website = ma.String(dump_only=True)
    composition = ma.auto_field()
    color = ma.auto_field()
    quantity = ma.auto_field()
    quantity_in_cart = ma.Integer(dump_only=True)
    sizes = ma.List(ma.String())
    # mainImage = ma.Raw(type='file')
    subImages = ma.List(FileField())  # Allow input

    @validates('title')
    def validate_title(self, value):
        if not (3 <= len(value) <= 84):
            raise ValidationError("Title must be between 3 and 84 characters long.")
        return value

    @validates('deadline')
    def validate_deadline(self, value):
        if value < 1:
            raise ValidationError("Deadline must be a positive number.")
        return value

    @validates('goal')
    def validate_goal(self, value):
        if value < 1:
            raise ValidationError("Goal must be at least 1.")
        return value

    @validates('price')
    def validate_price(self, value):
        if value < 0:
            raise ValidationError("Price cannot be negative.")
        return value

    @validates('artist_name')
    def validate_artist_name(self, value):
        if not value.strip():
            raise ValidationError("Artist name cannot be empty.")
        if len(value) > 120:
            raise ValidationError("Artist name must not exceed 120 characters.")
        return value

    @validates('composition')
    def validate_composition(self, value):
        if value and not isinstance(value, str):
            raise ValidationError("Composition must be a string.")
        return value

    @validates('color')
    def validate_color(self, value):
        if value and not isinstance(value, str):
            raise ValidationError("Color must be a string.")
        return value

    @validates('quantity')
    def validate_quantity(self, value):
        if value < 0:
            raise ValidationError("Quantity cannot be negative.")
        elif not isinstance(value, int):
            raise ValidationError("Quantity must be a valid integer.")
        return value

    @validates('sizes')
    def validate_sizes(self, value):
        if not isinstance(value, list):
            raise ValidationError("Sizes must be a list of strings.")
        for size in value:
            if not isinstance(size, str) or not size.strip():
                raise ValidationError("Each size must be a non-empty string.")
        return value

    # @validates('mainImage')
    # def validate_main_image(self, value):
    #     if not value or not hasattr(value, 'filename'):
    #         raise ValidationError("A valid main image file is required.")
    #     if not value.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
    #         raise ValidationError("Only PNG, JPG, JPEG, or GIF files are allowed for main image.")
    #     if hasattr(value, 'content_length') and value.content_length > 2 * 1024 * 1024:  # 2MB limit
    #         raise ValidationError("Image file size must not exceed 2MB.")
    #     return value

    @validates('subImages')
    def validate_sub_images(self, value):
        if not isinstance(value, list):
            raise ValidationError("SubImages must be a list.")
        if len(value) < 2:
            raise ValidationError("At least two subimages are required.")
        for image in value:
            if not hasattr(image, 'filename'):
                raise ValidationError("Each subimage must be a valid file with a filename.")
            if not image.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                raise ValidationError("Only PNG, JPG, JPEG, or GIF files are allowed for subimages.")
            if hasattr(image, 'content_length') and image.content_length > 2 * 1024 * 1024:  # 2MB limit
                raise ValidationError(f"Subimage '{image.filename}' exceeds the 2MB size limit.")
        return value


    @pre_load
    def process_product(self, data, **kwargs):
        """Ensure sizes are properly formatted."""
        if 'sizes' in data and isinstance(data['sizes'], list):
            # Check if any item is a single comma-separated string
            if len(data['sizes']) == 1 and isinstance(data['sizes'][0], str) and ',' in data['sizes'][0]:
                data['sizes'] = data['sizes'][0].split(',')
        return data


class OrderSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Order
        include_fk = True
        ordered = True

    id = ma.auto_field(dump_only=True)
    # quantity = ma.auto_field(required=True)  # Optional
    price = ma.auto_field(required=True)
    status = ma.auto_field(required=True, validate=validate.Length(min=1, max=100))
    payment_id = ma.auto_field(required=True, validate=validate.Length(min=1, max=100))
    products = ma.Nested(ProductSchema, many=True, dump_only=True)  # Correct declaration
    timestamp = ma.auto_field(dump_only=True)
    # Nested relationships
    customer = ma.Nested(UserSchema, dump_only=True)

    @validates('price')
    def validate_price(self, value):
        if value <= 0:
            raise ValidationError("Price must be greater than 0.")
        if value > 1_000_000:
            raise ValidationError("Price cannot exceed 1,000,000.")
        return value

    @validates('status')
    def validate_status(self, value):
        allowed_statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
        if value.lower() not in allowed_statuses:
            raise ValidationError(f"Status must be one of: {', '.join(allowed_statuses)}.")
        return value

    @validates('payment_id')
    def validate_payment_id(self, value):
        if len(value.strip()) < 5:
            raise ValidationError("Payment ID must be at least 5 characters long.")
        return value


class TokenSchema(ma.Schema):
    class Meta:
        ordered = True

    access_token = ma.String(required=True)
    refresh_token = ma.String()


class PasswordResetRequestSchema(ma.Schema):
    class Meta:
        ordered = True

    email = ma.String(required=True, validate=[validate.Length(max=120),
                                               validate.Email()])


class PasswordResetSchema(ma.Schema):
    class Meta:
        ordered = True

    token = ma.String(required=True)
    new_password = ma.String(required=True, validate=validate.Length(min=3))


class OAuth2Schema(ma.Schema):
    code = ma.String(required=True)
    state = ma.String(required=True)