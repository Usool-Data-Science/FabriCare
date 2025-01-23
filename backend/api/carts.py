import os
import stripe
from flask import Blueprint, abort, jsonify
from flask import current_app as app

from api import db
from api.app import cache
from api.schemas import CartSchema, DateTimePaginationSchema
from api.decorators import paginated_response
from api.tokens import token_auth
from api.auth import role_required
from api.models import Cart, User, Product
from apifairy import authenticate, response

carts_bp = Blueprint('carts', __name__)

cart_schema = CartSchema()
carts_schema = CartSchema(many=True)
update_cart_schema = CartSchema(partial=True)


@carts_bp.route('/carts', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(carts_schema, order_by=Cart.timestamp, order_direction='desc', pagination_schema=DateTimePaginationSchema)
@role_required('admin')
def get_all_cart():
    """Get all carts"""
    carts = db.session.query(Cart)
    return carts


@carts_bp.route('/me/carts', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(carts_schema, order_by=Cart.timestamp, order_direction='desc', pagination_schema=DateTimePaginationSchema)
def get_my_cart():
    """Return the cart of the current user"""
    user = token_auth.current_user()

    # Get the cart query
    carts = db.session.query(Cart).filter_by(customer_id=user.id)

    # Calculate the total price of all items in the cart
    price_list = [cart.quantity * cart.product.price for cart in carts]
    total_price = sum(price_list)
    
    # Pass the total price as extra data
    return carts, {'extra_data': {'total_price': total_price, 'plus_tax': total_price + total_price * 0.1}}



@carts_bp.route('/carts/<name>', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(carts_schema, order_by=Cart.timestamp, order_direction='desc', pagination_schema=DateTimePaginationSchema)
@role_required('admin')
def get_user_cart(name):
    """Return the cart of a specific user"""
    user = db.session.query(User).filter_by(username=name).one()
    cart = db.session.query(Cart).filter_by(customer_id=user.id)
    return cart


@carts_bp.route('/create-checkout-session', methods=['POST'])
@authenticate(token_auth)
def order():
    # Fetch cart items for the current user
    user = token_auth.current_user()
    products = user.cart_items
    if not products:
        abort(404, 'Your cart is empty')

    if os.environ.get('ENV') != 'local':
        success_url = 'https://sweetlatex.com/order/success'
        cancel_url = 'https://sweetlatex.com/order/cancel'
    else:
        success_url='http://localhost:3000/order/success'
        cancel_url='http://localhost:3000/order/cancel'

    try:
        # Prepare line items for Stripe checkout session
        line_items = [
            {
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': product.product.title,  # Access object attributes
                    },
                    'unit_amount': int(product.product.price * 100),  # Convert price to cents
                },
                'quantity': product.quantity,
                'adjustable_quantity': (
                    product.adjustable_quantity
                    if hasattr(product, 'adjustable_quantity')
                    else {'enabled': False}
                ),
            }
            for product in products
        ]

        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            customer_email=user.email,
            line_items=line_items,
            payment_method_types=['card'],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
        )
        cache.flush() # Clear the cache.

        return jsonify({"session_url": checkout_session.url})

    except KeyError as e:
        abort(400, f"Missing key in product data: {e}")
    except Exception as e:
        abort(500, f"An error occurred: {e}")



@carts_bp.route('/carts/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
@role_required('admin')
def remove_cart(id):
    """removes a product from cart"""
    cart = db.session.get(Cart, id)
    db.session.delete(cart)
    db.session.commit()
    cache.flush() # Clear the cache.

    return {}

@carts_bp.route('/me/carts/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
def remove_cart_product(id):
    """Remove a product from cart"""
    try:
        customer_id = token_auth.current_user().id
        cart = db.session.query(Cart).filter_by(customer_id=customer_id, id=id).first()
        
        if cart is None:
            return abort(404, f"Cart item with product_id {id} not found for customer {customer_id}")
        
        db.session.delete(cart)
        db.session.commit()
        cache.flush() # Clear the cache.
        return {}, 204
    except Exception as e:
        print("Error occurred:", e)
        return abort(500, 'Database Error')




@carts_bp.route('/products/carts/<int:item_id>', methods=['POST'])
@authenticate(token_auth)
@response(cart_schema, 201)
def add_to_cart(item_id):
    """Add a product to cart"""
    item_to_add = Product.query.get(item_id)
    print(item_to_add.title)
    item_exists = Cart.query.filter_by(product_id=item_id, customer_id=token_auth.current_user().id).first()
    if item_exists:
        print("Item exists")
        try:
            item_exists.quantity = item_exists.quantity + 1
            db.session.commit()
            print(item_exists.quantity)
            return item_exists
        except Exception as e:
            print('Quantity not Updated', e)
            return abort(500, f'Quantity not Updated: {e}')

    new_cart_item = Cart(quantity=1, product_id=item_to_add.id, customer_id=token_auth.current_user().id)
    print("New cart id: ", new_cart_item.id)
    try:
        db.session.add(new_cart_item)
        db.session.commit()
        return new_cart_item
    except Exception as e:
        print('Item not added to cart', e)
        return abort(500, f'Quantity not Updated: {e}')
