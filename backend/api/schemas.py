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
    timestamp = ma.auto_field(dump_only=True)
    # Nested relationships
    product = ma.Nested(lambda: ProductSchema(only=('id', 'quantity', 'title', 'price', 'mainImage')), dump_only=True)
    customer = ma.Nested(lambda: UserSchema(only=('id','username')), dump_only=True)


class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        ordered = True

    id = ma.auto_field(dump_only=True) # Id is read only
    url = ma.String(dump_only=True)
    # If you fall into recursive error here, checkout this docs:
    # https://marshmallow.readthedocs.io/en/stable/nesting.html#nesting-a-schema-within-itself
    # cart_items = ma.List(ma.Nested(CartSchema(exclude=("customer",))))
    cart_size = ma.Integer(dump_only=True)
    first_name = ma.String(required=True,
                             validate=validate.Length(min=3, max=50))
    last_name = ma.String(required=True,
                             validate=validate.Length(min=3, max=50))
    avatar = ma.String()
    username = ma.auto_field(required=True,
                             validate=validate.Length(max=64))
    email = ma.auto_field(required=True,
                             validate=validate.Length(max=120))
    password = ma.String(required=True, load_only=True,
                         validate=validate.Length(min=3))
    role = ma.String()
    # order_url = ma.URLFor('orders.all_user_orders', values={'id': '<id>'}, dump_only=True)

    @validates('username')
    def validate_username(self, value):
        if not value[0].isalpha():
            raise ValidationError('Username must start with a letter')
        user = token_auth.current_user()
        old_username = user.username if user else None
        if value != old_username and \
                db.session.query(User).filter_by(username=value).first():
            raise ValidationError('Use a different username.')

    @validates('email')
    def validate_email(self, value):
        user = token_auth.current_user()
        old_email = user.email if user else None
        if value != old_email and \
                db.session.query(User).filter_by(email=value).first():
            raise ValidationError('Use a different email.')

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
    # first_name = ma.String(required=True)
    # last_name = ma.String(required=True)
    image = ma.Raw(type='file')
    description = ma.String(required=True)
    website = ma.String(requied=True, validate=validate.Length(min=10, max=500))


class ProductSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Product
        include_fk = True
        ordered = True

    id = ma.Integer(dump_only=True)
    title = ma.auto_field(required=True, validate=validate.Length(min=1, max=84))
    deadline = ma.auto_field(required=True, validate=validate.Range(min=1))
    days_left = ma.Integer(dump_only=True)
    goal = ma.auto_field(required=True, validate=validate.Range(min=1))
    price = ma.auto_field(required=True, validate=validate.Range(min=0))
    artist_name = ma.String(required=True)
    artist_details = ma.String(dump_only=True)
    artist_website = ma.String(dump_only=True)
    composition = ma.auto_field()
    color = ma.auto_field()
    quantity = ma.auto_field(validate=validate.Range(min=0))
    quantity_in_cart = ma.Integer(dump_only=True)
    sizes = ma.List(ma.String())
    # mainImage = FileField()  # FileField() doesn't work with FormData() of react
    mainImage = ma.Raw(type='file')
    subImages = ma.List(FileField())  # Allow input

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