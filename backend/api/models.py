from datetime import datetime, timedelta
from hashlib import md5
import secrets
from time import time
from typing import Optional, List
from sqlalchemy.orm import relationship
from flask import current_app, url_for
import jwt
import sqlalchemy as sa
from sqlalchemy import orm as so
from werkzeug.security import generate_password_hash, check_password_hash

from api.app import db
from api.dates import naive_utcnow


class Updateable:
    """
    Mixin class for models that supports updating fields from a dictionary.
    """

    def update(self, data: dict):
        """
        Updates the model's attributes with the given data.

        Args:
            data (dict): Dictionary containing the attribute names and their new values.
        """
        for attr, value in data.items():
            setattr(self, attr, value)


class BaseModel(db.Model):
    """
    Base model class with common attributes for other models.

    Attributes:
        id (int): Primary key for the model.
        timestamp (datetime): Creation timestamp of the model instance.
    """
    __abstract__ = True  # Ensures BaseModel doesn't create a table in the DB

    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=naive_utcnow
    )


# Association table for many-to-many relationship between orders and products.
order_products = sa.Table(
    'order_products',
    db.Model.metadata,
    sa.Column('order_id', sa.ForeignKey('orders.id', ondelete='CASCADE'),
              primary_key=True),
    sa.Column('product_id', sa.ForeignKey('products.id', ondelete='CASCADE'),
              primary_key=True)
)


class Token(BaseModel):
    """
    Model representing an authorization token for user authentication.

    Attributes:
        access_token (str): Access token string.
        access_expiration (datetime): Expiration date and time of the access token.
        refresh_token (str): Refresh token string.
        refresh_expiration (datetime): Expiration date and time of the refresh token.
        user_id (int): Foreign key to the User model.
        user (User): Relationship to the User model.
    """
    __tablename__ = 'tokens'

    access_token: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    access_expiration: so.Mapped[datetime]
    refresh_token: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    refresh_expiration: so.Mapped[datetime]
    user_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('users.id', ondelete='CASCADE'), index=True
    )
    user: so.Mapped['User'] = so.relationship(back_populates='tokens')

    @property
    def access_token_jwt(self) -> str:
        """
        Generates a JWT for the access token.

        Returns:
            str: Encoded JWT token containing the access token.
        """
        return jwt.encode(
            {'token': self.access_token},
            current_app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )

    def generate(self):
        """
        Generates new access and refresh tokens with their respective expiration times.
        """
        self.access_token = secrets.token_urlsafe()
        self.access_expiration = naive_utcnow() + timedelta(
            minutes=current_app.config.get('ACCESS_TOKEN_MINUTES')
        )
        self.refresh_token = secrets.token_urlsafe()
        self.refresh_expiration = naive_utcnow() + timedelta(
            days=current_app.config.get('REFRESH_TOKEN_DAYS')
        )

    def expire(self, delay: Optional[int] = None):
        """
        Expires the token after a given delay.

        Args:
            delay (Optional[int]): Time in seconds before token expiration. Defaults to 5 seconds or 0 in testing mode.
        """
        if delay is None:  # pragma: no branch
            delay = 5 if not current_app.testing else 0
        self.access_expiration = naive_utcnow() + timedelta(seconds=delay)
        self.refresh_expiration = naive_utcnow() + timedelta(seconds=delay)

    @staticmethod
    def clean():
        """
        Removes expired tokens that have been expired for more than a day.
        """
        yesterday = naive_utcnow() - timedelta(days=1)

        # Query expired tokens
        expired_tokens = db.session.query(Token).filter(
            Token.refresh_expiration < yesterday
        ).all()

        # Delete each expired token
        for token in expired_tokens:
            db.session.delete(token)

        # Commit changes to the database
        db.session.commit()

    @staticmethod
    def from_jwt(access_token_jwt: str) -> Optional['Token']:
        """
        Decodes a JWT and retrieves the associated Token instance.

        Args:
            access_token_jwt (str): Encoded JWT access token.

        Returns:
            Optional[Token]: The Token instance if valid, otherwise None.
        """
        try:
            decoded = jwt.decode(
                access_token_jwt,
                current_app.config.get('SECRET_KEY'),
                algorithms=['HS256']
            )
            access_token = decoded['token']
            return db.session.query(Token).filter_by(
                access_token=access_token
            ).first()
        except jwt.PyJWTError as error:
            print("JWT decoding error:", error)  # Debugging
            return None


class User(Updateable, BaseModel):
    """Represents a customer's profile in the system."""
    
    __tablename__ = 'users'

    first_name: so.Mapped[str] = so.mapped_column(sa.String(50))
    last_name: so.Mapped[str] = so.mapped_column(sa.String(50))
    username: so.Mapped[Optional[str]] = so.mapped_column(sa.String(64), unique=True, index=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(150))
    date_joined: so.Mapped[datetime] = so.mapped_column(
        index=True, default=lambda: datetime.now(timezone.utc)
    )
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(250))

    # Tokens should have passive deletes
    tokens: so.Mapped['Token'] = so.relationship(
        back_populates='user', lazy='select', cascade="all, delete-orphan"
    )

    role: so.Mapped[str] = so.mapped_column(sa.String(50), nullable=False, default='client')

    orders: so.Mapped[List['Order']] = so.relationship(
        'Order', back_populates='customer', lazy='select', cascade="all, delete-orphan"
    )

    cart_items: so.Mapped[List['Cart']] = so.relationship(
        'Cart', back_populates='customer', lazy='select', cascade='all, delete-orphan'
    )

    @property
    def url(self):
        """Return the URL for the user's profile."""
        return url_for('users.get', id=self.id)

    @property
    def avatar(self, size=80):
        """Generate a gravatar URL using the user's email."""
        digest = md5(self.email.lower().encode('utf-8')).hexdigest()
        return f'https://www.gravatar.com/avatar/{digest}?d=identicon&s={size}'

    @property
    def cart_size(self):
        """Return the number of items in the user's cart."""
        return len(db.session.get(User, self.id).cart_items)

    @property
    def has_password(self):
        """Return True if the user has a password set."""
        return self.password_hash is not None

    @property
    def password(self):
        """Prevent reading the password directly."""
        raise AttributeError('Password is not a readable Attribute')

    @password.setter
    def password(self, password):
        """Set a hashed password for the user."""
        if not password:
            raise ValueError('Password cannot be empty!')
        self.password_hash = generate_password_hash(password=password)

    def verify_password(self, password):
        """Verify the provided password against the stored hash."""
        return check_password_hash(self.password_hash, password)

    def ping(self):
        """Update the user's 'last seen' timestamp."""
        self.last_seen = naive_utcnow()

    def generate_auth_token(self):
        """Generate and return an authentication token for the user."""
        token = Token(user=self)
        token.generate()
        return token

    @staticmethod
    def verify_access_token(access_token_jwt, refresh_token=None):
        """Verify the provided access token and return the associated user."""
        token = Token.from_jwt(access_token_jwt)
        if token:
            if token.access_expiration > naive_utcnow():
                token.user.ping()
                db.session.commit()
                return token.user
        return None

    @staticmethod
    def verify_refresh_token(refresh_token, access_token_jwt):
        """Verify the provided refresh token and return the associated token."""
        token = Token.from_jwt(access_token_jwt)
        if token and token.refresh_token == refresh_token:
            if token.refresh_expiration > naive_utcnow():
                return token

            # Revoking all tokens if the refresh token is expired
            token.user.revoke_all()
            db.session.commit()

    def revoke_all(self):
        """Revoke all tokens associated with this user."""
        db.session.execute(Token.delete().where(Token.user == self))

    def generate_reset_token(self):
        """Generate a token for resetting the user's password."""
        return jwt.encode(
            {
                'exp': time() + current_app.config.get('RESET_TOKEN_MINUTES') * 60,
                'reset_email': self.email,
            },
            current_app.config.get('SECRET_KEY'),
            algorithm='HS256'
        )

    @staticmethod
    def verify_reset_token(reset_token):
        """Verify the password reset token and return the associated user."""
        try:
            data = jwt.decode(reset_token, current_app.config.get('SECRET_KEY'),
                              algorithms=['HS256'])
        except jwt.PyJWTError:
            return
        return db.session.scalar(User.select().filter_by(email=data['reset_email']))

    def __repr__(self):
        """Return a string representation of the user."""
        return '<User {}>'.format(self.email)


class Artist(Updateable, BaseModel):
    """Represents an artist in the system."""
    
    __tablename__ = 'artists'

    name: so.Mapped[Optional[str]] = so.mapped_column(sa.String(64), unique=True, nullable=False)
    image: so.Mapped[Optional[str]] = so.mapped_column(sa.String(1000))
    description: so.Mapped[Optional[str]] = so.mapped_column(sa.String(1000))
    website: so.Mapped[Optional[str]] = so.mapped_column(sa.String(500))

    # Relationship with products
    products: so.Mapped[List['Product']] = so.relationship(
        'Product', back_populates='artist', lazy='select', cascade="all, delete-orphan"
    )

    def __repr__(self):
        """Return a string representation of the artist."""
        return '<Artist: {}>'.format(self.name)


class Product(Updateable, BaseModel):
    """Represents a product for sale."""

    __tablename__ = 'products'

    title: so.Mapped[str] = so.mapped_column(sa.String(84), index=True, unique=True, nullable=False)
    deadline: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    artist_name: so.Mapped[str] = so.mapped_column(sa.String(256), nullable=False)
    goal: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    mainImage: so.Mapped[Optional[str]] = so.mapped_column(sa.String(500))
    subImages: so.Mapped[Optional[List[str]]] = so.mapped_column(sa.JSON)
    composition: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    color: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    style: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    price: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer)
    quantity: so.Mapped[Optional[int]] = so.mapped_column(sa.Integer)
    sizes = so.mapped_column(sa.JSON)

    # Relationship with artist
    artist_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('artists.id', ondelete='CASCADE'), index=True, nullable=False
    )
    artist: so.Mapped['Artist'] = so.relationship('Artist', back_populates='products', lazy='joined')

    # Relationship with orders
    orders: so.Mapped[List['Order']] = so.relationship('Order', back_populates='products', secondary=order_products)

    # Relationship with cart items
    cart_items = so.relationship('Cart', back_populates='product', lazy='select', cascade='all, delete-orphan')

    @property
    def days_left(self):
        """
        Calculate the number of days left until the product's deadline.

        :return: int, days remaining until deadline
        """
        # Calculate the deadline date
        deadline_date = self.timestamp + timedelta(days=self.deadline)

        # Calculate the days remaining
        today = datetime.now()
        days_remaining = (deadline_date - today).days

        # Ensure the days remaining is not negative
        return max(0, days_remaining)

    @property
    def artist_details(self):
        """Return the artist's description."""
        return self.artist.description

    @property
    def artist_website(self):
        """Return the artist's website URL."""
        return self.artist.website

    def __repr__(self):
        """Return a string representation of the product.

        Returns:
            String: The product's title
        """
        return '<Product: {}>'.format(self.title)

class Order(BaseModel):
    """Represents a customer's order in the system."""
    
    __tablename__ = 'orders'

    price: so.Mapped[float] = so.mapped_column(sa.Float, nullable=False)
    status: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    payment_id: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)

    # Relationship with products
    products: so.Mapped[List['Product']] = relationship(
        'Product', secondary=order_products, back_populates='orders'
    )

    # Relationship with customer
    customer_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False
    )
    customer: so.Mapped['User'] = so.relationship('User', back_populates='orders', lazy='joined')

    def __repr__(self):
        """Return a string representation of the order."""
        return '<Order {}>'.format(self.id)


class Cart(BaseModel):
    """Represents a customer's cart item in the system."""

    __tablename__ = 'carts'

    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)

    # Relationship with customer
    customer_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False
    )
    customer: so.Mapped['User'] = so.relationship('User', back_populates='cart_items', lazy='joined')

    # Relationship with product
    product_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('products.id', ondelete='CASCADE'), index=True, nullable=False
    )
    product: so.Mapped['Product'] = so.relationship('Product', back_populates='cart_items', lazy='joined')

    def __repr__(self):
        """Return a string representation of the cart item."""
        return '<Cart {}>'.format(self.id)
