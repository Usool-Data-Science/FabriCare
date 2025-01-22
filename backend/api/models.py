from datetime import datetime, timedelta, timezone
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
    def update(self, data):
        for attr, value in data.items():
            setattr(self, attr, value)

class BaseModel(db.Model):
    __abstract__ = True   # Ensures BaseModel doesn't create a table in the DB
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    timestamp: so.Mapped[datetime] = so.mapped_column(
        index=True, default=naive_utcnow)

order_products = sa.Table(
    'order_products',
    db.Model.metadata,
    sa.Column('order_id', sa.ForeignKey('orders.id', ondelete='CASCADE'), primary_key=True),
    sa.Column('product_id', sa.ForeignKey('products.id', ondelete='CASCADE'), primary_key=True)
)

class Token(BaseModel):
    """Authorization token table"""
    __tablename__ = 'tokens'

    access_token: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    access_expiration: so.Mapped[datetime]
    refresh_token: so.Mapped[str] = so.mapped_column(sa.String(64), index=True)
    refresh_expiration: so.Mapped[datetime]
    user_id: so.Mapped[int] = so.mapped_column(
        sa.ForeignKey('users.id', ondelete='CASCADE'), index=True)

    # No ondelete param specified, since User.token uses passive_deletes
    user: so.Mapped['User'] = so.relationship(back_populates='tokens')

    @property
    def access_token_jwt(self):
        return jwt.encode({'token': self.access_token},
                          current_app.config.get('SECRET_KEY'),
                          algorithm='HS256')

    def generate(self):
        self.access_token = secrets.token_urlsafe()
        self.access_expiration = naive_utcnow() + \
            timedelta(minutes=current_app.config.get('ACCESS_TOKEN_MINUTES'))
        self.refresh_token = secrets.token_urlsafe()
        self.refresh_expiration = naive_utcnow() + \
            timedelta(days=current_app.config.get('REFRESH_TOKEN_DAYS'))

    def expire(self, delay=None):
        if delay is None:  # pragma: no branch
            # 5 second delay to allow simultaneous requests
            delay = 5 if not current_app.testing else 0
        self.access_expiration = naive_utcnow() + timedelta(seconds=delay)
        self.refresh_expiration = naive_utcnow() + timedelta(seconds=delay)

    from datetime import timedelta

    @staticmethod
    def clean():
        """Remove any tokens that have been expired for more than a day."""
        yesterday = naive_utcnow() - timedelta(days=1)

        # Query all expired tokens
        expired_tokens = db.session.query(Token).filter(Token.refresh_expiration < yesterday).all()

        # Delete each expired token
        for token in expired_tokens:
            db.session.delete(token)

        # Commit the changes to the database
        db.session.commit()


    @staticmethod
    def from_jwt(access_token_jwt):
        try:
            access_token = jwt.decode(
                access_token_jwt,
                current_app.config.get('SECRET_KEY'),
                algorithms=['HS256']
            )['token']
            token = db.session.query(Token).filter_by(access_token=access_token).first()
            return token
        except jwt.PyJWTError as e:
            print("JWT decoding error:", e)  # Debugging
            return None


class User(Updateable, BaseModel):
    """Customers' profile table"""
    __tablename__ = 'users'
    
    first_name: so.Mapped[str] = so.mapped_column(sa.String(50))
    last_name: so.Mapped[str] = so.mapped_column(sa.String(50))
    username: so.Mapped[Optional[str]] = so.mapped_column(sa.String(64), unique=True, index=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(150))
    date_joined: so.Mapped[datetime] = so.mapped_column(index=True, default= lambda: datetime.now(timezone.utc))
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(250))
    # Tokens should have passive deletes
    tokens: so.Mapped['Token'] = so.relationship(
        back_populates='user', lazy='select', cascade="all, delete-orphan")
    role: so.Mapped[str] = so.mapped_column(sa.String(50), nullable=False, default='client')

    orders: so.Mapped[List['Order']] = so.relationship('Order',back_populates='customer', lazy='select', cascade="all, delete-orphan")

    cart_items: so.Mapped[List['Cart']] = so.relationship('Cart', back_populates='customer', lazy='select', cascade='all, delete-orphan')

    @property
    def url(self):
        return url_for('users.get', id=self.id)
    
    @property
    def avatar(self, size=80):
        """Encodes user email and return their gravatar image"""
        digest = md5(self.email.lower().encode('utf-8')).hexdigest()
        return f'https://www.gravatar.com/avatar/{digest}?d=identicon&s={size}'


    @property
    def cart_size(self):
        return len(db.session.get(User, self.id).cart_items)

    @property
    def has_password(self):
        return self.password_hash is not None

    @property
    def password(self):
        raise AttributeError('Password is not a readable Attribute')

    @password.setter
    def password(self, password):
        if not password:
            raise ValueError('Password can not be empty!')
        self.password_hash = generate_password_hash(password=password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)


    def ping(self):
        self.last_seen = naive_utcnow()

    def generate_auth_token(self):
        token = Token(user=self)
        token.generate()
        return token

    @staticmethod
    def verify_access_token(access_token_jwt, refresh_token=None):
        token = Token.from_jwt(access_token_jwt)
        if token:
            if token.access_expiration > naive_utcnow():
                token.user.ping()
                db.session.commit()
                return token.user
        return None


    @staticmethod
    def verify_refresh_token(refresh_token, access_token_jwt):
        token = Token.from_jwt(access_token_jwt)
        if token and token.refresh_token == refresh_token:
            if token.refresh_expiration > naive_utcnow():
                return token

            # someone tried to refresh with an expired token
            # revoke all tokens from this user as a precaution
            token.user.revoke_all()
            db.session.commit()

    def revoke_all(self):
        db.session.execute(Token.delete().where(Token.user == self))

    def generate_reset_token(self):
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
        try:
            data = jwt.decode(reset_token, current_app.config.get('SECRET_KEY'),
                              algorithms=['HS256'])
        except jwt.PyJWTError:
            return
        return db.session.scalar(User.select().filter_by(
            email=data['reset_email']))

    def __repr__(self):
        return '<User {}>'.format(self.email)


class Artist(Updateable, BaseModel):
    """Artists Table"""
    __tablename__ = 'artists'

    name: so.Mapped[Optional[str]] = so.mapped_column(sa.String(64), unique=True, nullable=False)
    image: so.Mapped[Optional[str]] = so.mapped_column(sa.String(1000))
    description: so.Mapped[Optional[str]] = so.mapped_column(sa.String(1000))
    website: so.Mapped[Optional[str]] = so.mapped_column(sa.String(500))

    # Relationship
    products: so.Mapped[List['Product']] = so.relationship('Product', back_populates='artist', lazy='select', cascade="all, delete-orphan")

    def __repr__(self):
        """Official Representation of the object"""
        return '<Artist: {}>'.format(self.name)


class Product(Updateable, BaseModel):
    """The product of sale"""

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

    # Relationship
    artist_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey('artists.id', ondelete='CASCADE'), index=True, nullable=False)
    artist: so.Mapped['Artist'] = so.relationship('Artist', back_populates='products', lazy='joined')

    orders: so.Mapped[List['Order']] = so.relationship('Order', back_populates='products', secondary=order_products)

    cart_items = so.relationship('Cart', back_populates='product', lazy='select', cascade='all, delete-orphan')

    @property
    def days_left(self):
        """
        Calculate the number of days left from the deadline.

        :return: int, days remaining
        """
        # Calculate the deadline date
        deadline_date = self.timestamp + timedelta(days=self.deadline)

        # Calculate days left
        today = datetime.now()
        days_remaining = (deadline_date - today).days

        # Ensure the days remaining is not negative
        return max(0, days_remaining)
    
    @property
    def artist_details(self):
        return self.artist.description

    @property
    def artist_website(self):
        return self.artist.website


    def __repr__(self):
        """Official Representation of the object

        Returns:
            String: The sweater's name
        """
        return '<Product: {}>'.format(self.title)


class Order(BaseModel):
    """Customers' orders table"""
    __tablename__ = 'orders'

    price: so.Mapped[float] = so.mapped_column(sa.Float, nullable=False)
    status: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)
    payment_id: so.Mapped[str] = so.mapped_column(sa.String(100), nullable=False)

    # Relationship
    products: so.Mapped[List['Product']] = relationship(
        'Product', secondary=order_products, back_populates='orders'
    )

    customer_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False)
    customer: so.Mapped['User'] = so.relationship('User', back_populates='orders', lazy='joined')

    def __repr__(self):
        return '<Order {}>'.format(self.id)


class Cart(BaseModel):
    """Customers' cart items table"""
    __tablename__ = 'carts'

    quantity: so.Mapped[int] = so.mapped_column(sa.Integer, nullable=False)
    customer_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False)
    customer: so.Mapped['User'] = so.relationship('User',back_populates='cart_items', lazy='joined')

    product_id: so.Mapped[int] = so.mapped_column(sa.ForeignKey('products.id', ondelete='CASCADE'), index=True, nullable=False)

    product: so.Mapped['Product'] = so.relationship('Product', back_populates='cart_items', lazy='joined')

    def __repr__(self):
        return '<Cart {}>'.format(self.id)