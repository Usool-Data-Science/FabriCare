import json
import stripe
from flask import request, abort, Blueprint, jsonify
from api import db
from api.app import cache
from api.app import endpoint_secret
from api.auth import token_auth, role_required
from api.decorators import paginated_response
from api.models import Order, Cart
from api.schemas import OrderSchema, DateTimePaginationSchema
from api.utilities import handle_failed_payment, handle_successful_payment
from apifairy import authenticate


orders_bp = Blueprint('orders', __name__)
order_schema = OrderSchema()
orders_schema = OrderSchema(many=True)
update_orders_schema = OrderSchema(partial=True)


@orders_bp.route('/orders', methods=['GET'], strict_slashes=False)
@authenticate(token_auth)
@paginated_response(schema=order_schema, pagination_schema=DateTimePaginationSchema, order_by=Order.timestamp, order_direction='desc')
@role_required('admin')
def get_orders():
    """Return paginated list of orders"""
    return db.session.query(Order)


@orders_bp.route('/orders/<int:id>', methods=['DELETE'], strict_slashes=False)
@authenticate(token_auth)
@role_required('admin')
def delete_orders(id):
    """Delete an order"""
    order = db.session.get(Order, id)
    db.session.delete(order)
    db.session.commit()
    if cache is not None:
        cache.flush() # Clear the cache. # Clear the cache.

    return {}


@orders_bp.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    event = None
    # payload = request.data
    # sig_header = request.headers['STRIPE_SIGNATURE']

    # Verify the webhook signature
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        abort(400, 'Invalid payload')
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        abort(400, 'Invalid signature')

    # Handle the event
    if event['type'] == 'checkout.session.completed':
    # if event['type'] == 'payment_intent.completed':
        session = stripe.checkout.Session.retrieve(event['data']['object'].id, expand=['line_items', 'customer'])
        print(session)
        handle_successful_payment(session)
    elif event['type'] == 'payment_intent.payment_failed':
        session = event['data']['object']  # contains a Stripe PaymentIntent
        handle_failed_payment(session)

    # return '', 200
    return jsonify(success=True)


# @orders_bp.route('/webhooks/stripe', methods=['POST'])
# def new_stripe_webhook():
#     payload = request.body
#     event = None

#     try:
#         event = stripe.Event.construct_from(
#         json.loads(payload), stripe.api_key
#         )
#     except ValueError as e:
#         # Invalid payload
#         return abort(400)

#     # Handle the event
#     if event.type == 'payment_intent.succeeded':
#         payment_intent = event.data.object # contains a stripe.PaymentIntent
#         # Then define and call a method to handle the successful payment intent.
#         # handle_payment_intent_succeeded(payment_intent)
#     elif event.type == 'payment_method.attached':
#         payment_method = event.data.object # contains a stripe.PaymentMethod
#         # Then define and call a method to handle the successful attachment of a PaymentMethod.
#         # handle_payment_method_attached(payment_method)
#     # ... handle other event types
#     else:
#         print('Unhandled event type {}'.format(event.type))

#     return {}, 200