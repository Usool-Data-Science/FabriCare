import sqlalchemy as sa
import sqlalchemy.orm as so

from flask import current_app, abort
import random
from faker import Faker
from datetime import timezone
from api.app import create_app, db
from api.models import User, Product, Cart, Order, Artist

fake = Faker()

def users(num):
    """Creates the given number of fake users"""
    try:
        if num and num > 0:
            for i in range(num):
                fake_user = User(
                first_name=fake.name(),
                last_name=fake.last_name(),
                username=fake.user_name(),
                email=fake.email(),
                date_joined=fake.date_time_this_year(tzinfo=timezone.utc),
                role=random.choice(['client', 'moderator'])
            )
                fake_user.password = fake.password(length=12)
                db.session.add(fake_user)
                db.session.commit()
        print('Creating test user and admin...')
        u1 = User(first_name='non-admin', last_name='user', username='testuser', email='non-admin@gmail.com', password='123456')
        u2 = User(first_name='admin', last_name='user', username='testadmin', email='adminuser@gmail.com', password='123456', role='admin')
        db.session.add_all([u1, u2])
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print("Error: ", str(e))


def artists(num):
    """Creates the given number of fake users"""
    try:
        for i in range(num):
            fake_artist = Artist(
            name = fake.name(),
            # last_name=fake.last_name(),
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
                artist_name=artist.name,
                goal=fake.random_int(min=100, max=1000),
                mainImage=fake.image_url(),
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


def orders(num):
    """Creates the given number of fake orders"""
    try:
        for i in range(num):
            # Choose a random Product and a random user
            products = Product.query.order_by(db.func.random()).limit(3).all()  # Randomly pick a Product
            user = User.query.order_by(db.func.random()).first()  # Randomly pick a user

            fake_order = Order(
                # quantity=fake.random_int(min=1, max=10),
                price=fake.random_number(digits=3),
                status=random.choice(["pending", "shipped", "delivered"]),
                payment_id=fake.uuid4(),  # Unique payment ID
                products=products,  # Assign the random Product
                customer=user  # Assign the random user
            )
            db.session.add(fake_order)

        db.session.commit()
        # print("{} orders instances has been created!".format(num))
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")


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
                product_id=product.id,  # Assign the random Product
                size=random.choice(["S", "M", "L", "XL"]),
            )
            db.session.add(fake_cart)
        db.session.commit()
        # print("{} carts instances has been created!".format(num))
    except Exception as e:
        db.session.rollback()
        print(f"Error: {str(e)}")


def allowed_file(file):
        return (
            file.filename
            and '.' in file.filename
            and file.filename.rsplit('.', 1)[1].lower() in current_app.config.get('ALLOWED_EXTENSIONS')
        )


def handle_successful_payment(session):
    """Clear user cart and create order record"""
    customer_email = session['customer_email']
    user = User.query.filter_by(email=customer_email).one()
    # Clear the user's cart
    if user.cart_items:
        for item in user.cart_items:
            db.session.delete(item)
        db.session.commit()

        try:
            ordered_items = session['line_items']['data']
            ordered_items_description = [item['description'] for item in ordered_items]

            # Optionally, create an order record
            new_order = Order(
                price=session['amount_total'] / 100, # Amount in cents
                status=session['status'],
                payment_id=session['id'],
                customer=user,
                # products = ordered_items_description,
                products = Product.query.filter(Product.title.in_(ordered_items_description)).all()
                )
            db.session.add(new_order)
            db.session.commit()
        except Exception as e:
            abort(500, f"Error create orders: {e}")
    

        # Additional actions like sending a confirmation email, etc.
    else:
        print("Webhook handling was successful, with invalid user")


def handle_failed_payment(session):
    customer_email = session['customer_email']
    print(f"Webhook customer email: {customer_email}")
    customer_id = User.query.filter_by(email=customer_email).id
    # Notify the user or take other actions (like keeping the cart intact)
    print(f"Payment failed for customer {customer_id}. Please retry.")
