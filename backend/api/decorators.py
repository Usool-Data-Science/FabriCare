from apifairy import arguments, response
from flask import abort, jsonify, request
from functools import wraps
import sqlalchemy as sqla
import json

from api.schemas import StringPaginationSchema, PaginatedCollection
from api.app import cache
from api.app import db

# def paginated_response(schema, max_limit=25, order_by=None, 
#                        order_direction='asc',
#                        pagination_schema=StringPaginationSchema):
#     def inner(f):
#         @wraps(f)
#         def paginate(*args, **kwargs):
#             args = list(args)
#             pagination = args.pop(-1)
#             result = f(*args, **kwargs)

#             # Handle query and extra data if returned as a tuple
#             if isinstance(result, tuple):
#                 select_query, extra_data = result
#             else:
#                 select_query = result
#                 extra_data = {}

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

#             # Construct the response
#             response = {
#                 'data': data,
#                 'pagination': {
#                     'offset': offset,
#                     'limit': limit,
#                     'count': len(data),
#                     'total': count,
#                 },
#             }

#             # Include extra data if provided
#             response.update(extra_data)

#             return response

#         # wrap with APIFairy's arguments and response decorators
#         return arguments(pagination_schema)(response(PaginatedCollection(
#             schema, pagination_schema=pagination_schema))(paginate))

#     return inner


### GPT SOLUTION

def paginated_response(schema, max_limit=25, order_by=None,
                       order_direction='asc',
                       pagination_schema=StringPaginationSchema,
                       cache_ttl=1000):  # Allow configurable cache TTL

    def inner(route_function):
        @wraps(route_function)
        def paginate(*args, **kwargs):
            args = list(args)
            pagination = args.pop(-1)
            response = None

            # Generate a unique cache key based on the request URL and pagination parameters
            cache_key = f"{request.path}:{json.dumps(request.args, sort_keys=True)}"

            # Check if response exists in cache
            response = cache.get(cache_key)
            if response:
                response['source'] = 'cache'
                return response

            # If response is not cached, execute the original route function
            result = route_function(*args, **kwargs)

            # Process the result (pagination logic)
            if isinstance(result, tuple):
                select_query, extra_data = result
            else:
                select_query = result
                extra_data = {}

            if order_by is not None:
                o = order_by.desc() if order_direction == 'desc' else order_by
                select_query = select_query.order_by(o)

            count = db.session.scalar(
                sqla.select(sqla.func.count()).select_from(select_query.subquery())
            )

            limit = pagination.get('limit', max_limit)
            offset = pagination.get('offset')
            after = pagination.get('after')
            if limit > max_limit:
                limit = max_limit

            if after is not None:
                if offset is not None or order_by is None:
                    abort(400)
                order_condition = order_by < after if order_direction == 'desc' else order_by > after
                query = select_query.limit(limit).filter(order_condition)
                offset = db.session.scalar(
                    sqla.select(sqla.func.count())
                        .select_from(select_query.filter(order_condition).subquery())
                )
            else:
                if offset is None:
                    offset = 0
                if offset < 0 or (count > 0 and offset >= count) or limit <= 0:
                    abort(400)
                query = select_query.limit(limit).offset(offset)

            data = db.session.scalars(query).all()

            # Construct the response as a dictionary
            response = {
                'data': schema.dump(data, many=True),
                'pagination': {
                    'offset': offset,
                    'limit': limit,
                    'count': len(data),
                    'total': count,
                },
            }
            response.update(extra_data)
            response['source'] = 'db'  # Add source info for uncached responses

            # Cache the response for a specific TTL

            cache.set(cache_key, json.dumps(response), expire=cache_ttl)

            # Return the response as a dict, which will be processed by @response decorator
            response['data'] = data
            return response  # Return as a dictionary instead of jsonify

        return arguments(pagination_schema)(response(PaginatedCollection(
            schema, pagination_schema=pagination_schema))(paginate))

    return inner
