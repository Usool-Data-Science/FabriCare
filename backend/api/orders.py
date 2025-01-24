import json
import stripe
from flask import request, abort, Blueprint, jsonify
from api import db
from api.app import cache, endpoint_secret
from api.auth import token_auth, role_required
from api.decorators import paginated_response
from api.models import Order, Cart
from api.schemas import OrderSchema, DateTimePaginationSchema
from api.utilities import handle_failed_payment, handle_successful_payment
from apifairy import authenticate

# Blueprint setup
orders_bp = Blueprint('orders', __name__)

# Schema instances
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
update_orders_schema = OrderSchema(partial=True)


@orders_bp.route('/orders', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(
    schema=order_schema,
    pagination_schema=DateTimePaginationSchema,
    order_by=Order.timestamp,
    order_direction='desc'
)
@role_required('admin')
def get_orders():
    """
    Retrieve a paginated list of orders.

    This endpoint is restricted to admin users and returns orders
    in descending order based on the timestamp.
    """
    return db.session.query(Order)


@orders_bp.route('/orders/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
@role_required('admin')
def delete_orders(id):
    """
    Delete a specific order.

    This endpoint allows admin users to delete an order by its ID.
    It also clears the cache after deletion.
    """
    order = db.session.get(Order, id)
    if not order:
        abort(404, f"Order with ID {id} not found.")

    db.session.delete(order)
    db.session.commit()
    cache.flush()  # Clear the cache

    return {}, 204


@orders_bp.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    """
    Handle Stripe webhook events.

    This endpoint listens for Stripe webhook events, such as
    'checkout.session.completed' and 'payment_intent.payment_failed',
    to process successful and failed payments respectively.
    """
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')

    # Verify the webhook signature
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        # Invalid payload
        abort(400, 'Invalid payload')
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        abort(400, 'Invalid signature')

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = stripe.checkout.Session.retrieve(
            event['data']['object'].id,
            expand=['line_items', 'customer']
        )
        handle_successful_payment(session)
    elif event['type'] == 'payment_intent.payment_failed':
        session = event['data']['object']  # Stripe PaymentIntent object
        handle_failed_payment(session)

    return jsonify(success=True), 200
