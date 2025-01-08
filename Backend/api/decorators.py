from functools import wraps
from flask import abort
from api.auth import token_auth
from apifairy import arguments, response
import sqlalchemy as sqla
from api.app import db
from api.schemas import StringPaginationSchema, PaginatedCollection
from api.models import Cart, Product

# def paginated_response(schema, max_limit=25, order_by=None,
#                        order_direction='asc',
#                        pagination_schema=StringPaginationSchema):
#     def inner(f):
#         @wraps(f)
#         def paginate(*args, **kwargs):
#             args = list(args)
#             pagination = args.pop(-1)
#             select_query = f(*args, **kwargs)
#             if order_by is not None:
#                 o = order_by.desc() if order_direction == 'desc' else order_by
#                 select_query = select_query.order_by(o)

#             # Total count of items
#             count = db.session.scalar(sqla.select(
#                 sqla.func.count()).select_from(select_query.subquery()))

#             # Compute the total_price before pagination
#             # total_price_query = sqla.select(
#             #     sqla.func.sum(Cart.quantity * Cart.product.price)
#             # ).select_from(select_query.subquery())
#             # total_price = db.session.scalar(total_price_query) or 0  # Default to 0 if None

#             # Correct query to compute the total price of products in the cart
#             # Adjust the total_price_query to include a filter for the current user
#             total_price_query = sqla.select(
#                 sqla.func.sum(Cart.quantity * Product.price)
#             ).join(Product, Cart.product_id == Product.id) #.filter(Cart.customer_id == current_user().id)

#             total_price = db.session.scalar(total_price_query) or 0



#             # Handle pagination
#             limit = pagination.get('limit', max_limit)
#             offset = pagination.get('offset')
#             after = pagination.get('after')
#             if limit > max_limit:
#                 limit = max_limit
#             if after is not None:
#                 if offset is not None or order_by is None:  # pragma: no cover
#                     abort(400)
#                 if order_direction != 'desc':
#                     order_condition = order_by > after
#                     offset_condition = order_by <= after
#                 else:
#                     order_condition = order_by < after
#                     offset_condition = order_by >= after
#                 query = select_query.limit(limit).filter(order_condition)
#                 offset = db.session.scalar(sqla.select(
#                     sqla.func.count()).select_from(select_query.filter(
#                         offset_condition).subquery()))
#             else:
#                 if offset is None:
#                     offset = 0
#                 if offset < 0 or (count > 0 and offset >= count) or limit <= 0:
#                     abort(400)

#                 query = select_query.limit(limit).offset(offset)

#             # Fetch data for the current page
#             data = db.session.scalars(query).all()
#             return {
#                 'data': data,
#                 'pagination': {
#                     'offset': offset,
#                     'limit': limit,
#                     'count': len(data),
#                     'total': count,
#                 },
#                 'total_price': total_price  # Include total_price in the response
#             }

#         # wrap with APIFairy's arguments and response decorators
#         return arguments(pagination_schema)(response(PaginatedCollection(
#             schema, pagination_schema=pagination_schema))(paginate))

#     return inner

#DEFAULT
# def paginated_response(schema, max_limit=25, order_by=None,
#                        order_direction='asc',
#                        pagination_schema=StringPaginationSchema):
#     def inner(f):
#         @wraps(f)
#         def paginate(*args, **kwargs):
#             args = list(args)
#             pagination = args.pop(-1)
#             select_query = f(*args, **kwargs)
#             if order_by is not None:
#                 o = order_by.desc() if order_direction == 'desc' else order_by
#                 select_query = select_query.order_by(o)

#             count = db.session.scalar(sqla.select(
#                 sqla.func.count()).select_from(select_query.subquery()))

#             limit = pagination.get('limit', max_limit)
#             offset = pagination.get('offset')
#             after = pagination.get('after')
#             if limit > max_limit:
#                 limit = max_limit
#             if after is not None:
#                 if offset is not None or order_by is None:  # pragma: no cover
#                     abort(400)
#                 if order_direction != 'desc':
#                     order_condition = order_by > after
#                     offset_condition = order_by <= after
#                 else:
#                     order_condition = order_by < after
#                     offset_condition = order_by >= after
#                 query = select_query.limit(limit).filter(order_condition)
#                 offset = db.session.scalar(sqla.select(
#                     sqla.func.count()).select_from(select_query.filter(
#                         offset_condition).subquery()))
#             else:
#                 if offset is None:
#                     offset = 0
#                 if offset < 0 or (count > 0 and offset >= count) or limit <= 0:
#                     abort(400)

#                 query = select_query.limit(limit).offset(offset)

#             data = db.session.scalars(query).all()
#             return {'data': data, 'pagination': {
#                 'offset': offset,
#                 'limit': limit,
#                 'count': len(data),
#                 'total': count,
#             }}

#         # wrap with APIFairy's arguments and response decorators
#         return arguments(pagination_schema)(response(PaginatedCollection(
#             schema, pagination_schema=pagination_schema))(paginate))

#     return inner

def paginated_response(schema, max_limit=25, order_by=None, 
                       order_direction='asc',
                       pagination_schema=StringPaginationSchema):
    def inner(f):
        @wraps(f)
        def paginate(*args, **kwargs):
            args = list(args)
            pagination = args.pop(-1)
            result = f(*args, **kwargs)

            # Handle query and extra data if returned as a tuple
            if isinstance(result, tuple):
                select_query, extra_data = result
            else:
                select_query = result
                extra_data = {}

            if order_by is not None:
                o = order_by.desc() if order_direction == 'desc' else order_by
                select_query = select_query.order_by(o)

            count = db.session.scalar(sqla.select(
                sqla.func.count()).select_from(select_query.subquery()))

            limit = pagination.get('limit', max_limit)
            offset = pagination.get('offset')
            after = pagination.get('after')
            if limit > max_limit:
                limit = max_limit
            if after is not None:
                if offset is not None or order_by is None:  # pragma: no cover
                    abort(400)
                if order_direction != 'desc':
                    order_condition = order_by > after
                    offset_condition = order_by <= after
                else:
                    order_condition = order_by < after
                    offset_condition = order_by >= after
                query = select_query.limit(limit).filter(order_condition)
                offset = db.session.scalar(sqla.select(
                    sqla.func.count()).select_from(select_query.filter(
                        offset_condition).subquery()))
            else:
                if offset is None:
                    offset = 0
                if offset < 0 or (count > 0 and offset >= count) or limit <= 0:
                    abort(400)

                query = select_query.limit(limit).offset(offset)

            data = db.session.scalars(query).all()

            # Construct the response
            response = {
                'data': data,
                'pagination': {
                    'offset': offset,
                    'limit': limit,
                    'count': len(data),
                    'total': count,
                },
            }

            # Include extra data if provided
            response.update(extra_data)

            return response

        # wrap with APIFairy's arguments and response decorators
        return arguments(pagination_schema)(response(PaginatedCollection(
            schema, pagination_schema=pagination_schema))(paginate))

    return inner
