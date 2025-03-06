import random
import click
from datetime import timezone
from flask import Blueprint
from faker import Faker
from api.app import db
from api.models import User, Artist, Product, Order, Cart

fake_bp = Blueprint('fake', __name__)
fake = Faker()

@fake_bp.cli.group()
def fakes():
    """Generates fake objects"""
    pass

# @fakes.command()
# @click.argument('num', type=int)
def users(num):
    """Creates the given number of fake users"""
    try:

        for i in range(num):
            fake_user = User(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            username=fake.user_name(),
            email=fake.email(),
            date_joined=fake.date_time_this_year(tzinfo=timezone.utc),
            role=random.choice(['client', 'admin', 'moderator'])
        )
            fake_user.password = fake.password(length=12)
            db.session.add(fake_user)
            db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("Error: ", str(e))

# @fakes.command()
# @click.argument('num', type=int)
def artists(num):
    """Creates the given number of fake users"""
    try:
        for i in range(num):
            fake_artist = Artist(
            name=fake.name(),
            image=fake.image_url(),
            description=fake.text(max_nb_chars=200),
            website=fake.url()
            )
            db.session.add(fake_artist)
        db.session.commit()
        # print("{} artists instances has been created!".format(num))
    except Exception as e:
        db.session.rollback()
        print(str(e))

# @fakes.command()
# @click.argument('num', type=int)
def products(num):
    """Creates the given number of fake Products with unique titles."""
    try:
        used_titles = set()

        for i in range(num):
            # Ensure unique title
            title = fake.word()
            while title in used_titles:
                title = fake.word()
            used_titles.add(title)

            # Choose a random artist
            artist = Artist.query.order_by(db.func.random()).first()

            fake_product = Product(
                title=title,
                deadline=fake.date_this_year().year,
                goal=fake.random_int(min=100, max=1000),
                # mainImage=fake.image_url(),
                subImages=[fake.image_url() for _ in range(3)],
                composition=fake.word(),
                color=fake.color_name(),
                style=fake.word(),
                price=fake.random_int(min=10, max=500),
                quantity=fake.random_int(min=1, max=50),
                sizes=["S", "M", "L", "XL"],
                artist_id=artist.id
            )
            db.session.add(fake_product)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")

# @fakes.command()
# @click.argument('num', type=int)
def orders(num):
    """Creates the given number of fake orders"""
    try:
        for i in range(num):
            # Choose a random Product and a random user
            product = Product.query.order_by(db.func.random()).first()  # Randomly pick a Product
            user = User.query.order_by(db.func.random()).first()  # Randomly pick a user

            fake_order = Order(
                quantity=fake.random_int(min=1, max=10),
                price=fake.random_number(digits=3),
                status=random.choice(["pending", "shipped", "delivered"]),
                payment_id=fake.uuid4(),  # Unique payment ID
                product_id=product.id,  # Assign the random Product
                customer_id=user.id  # Assign the random user
            )
            db.session.add(fake_order)

        db.session.commit()
        # print("{} orders instances has been created!".format(num))
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")

# @fakes.command()
# @click.argument('num', type=int)
def carts(num):
    """Creates the given number of fake cart items"""
    try:
        for i in range(num):
            # Choose a random user and Product
            user = User.query.order_by(db.func.random()).first()  # Randomly pick a user
            product = Product.query.order_by(db.func.random()).first()  # Randomly pick a Product

            fake_cart = Cart(
                quantity=fake.random_int(min=1, max=5),  # Random quantity between 1 and 5
                customer_id=user.id,  # Assign the random user
                Product_id=Product.id  # Assign the random Product
            )
            db.session.add(fake_cart)
        db.session.commit()
        # print("{} carts instances has been created!".format(num))
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")

@fakes.command()
@click.argument('num', type=int)
def create(num):
    """Create num users,
        num * 10 Products, num * 2 artist, num * 3 orders and num * 3 carts.
    """
    try:
        artist_count = num * 2
        products_count = num * 10
        orders_count = num * 3
        carts_count = num * 3
        users(num)
        artists(artist_count)
        products(products_count)
        orders(orders_count)
        carts(carts_count)
        print("Created {} users, {} artists, {} products, {} orders and {} carts.".format(
            num, artist_count, products_count, orders_count, carts_count
        ))
    except Exception as e:
        print("Error: {}".format(e))