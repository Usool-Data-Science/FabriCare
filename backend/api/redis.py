#!/usr/bin/python3
"""
Solutions to redis-python exercises
"""
from typing import Union, Callable, Any
from datetime import datetime as dt
from redis import ConnectionPool
from functools import wraps
from redis import Redis
from uuid import uuid4
import json
import os


redis_host: str = os.environ.get('REDIS_HOST')
redis_port: str = os.environ.get('REDIS_PORT')

def count_calls(method: Callable) -> Callable:
    """Track the number of calls to a redis method.

    Args:
        method (Callable): The cache function called

    Returns:
        Callable: The cache function called with its parameters.
    """
    @wraps(method)
    def invoker(self, *args, **kwargs) -> Any:
        """
        Invokes the redis cache method, increment its call counter while also preserve the arguments and docstring of the redis cache method.

        Returns:
            Any: Response of the original function
        """
        if isinstance(self._redis, Redis):
            self._redis.incr(method.__qualname__)
        return method(self, *args, **kwargs)
    return invoker

def call_history(method: Callable) -> Callable:
    """Stores the history of inputs and outputs for a particular function

    Args:
        method (Callable): a function to decorate

    Returns:
        Callable: The cache function called with its parameters.
    """
    @wraps(method)
    def invoker(self, *args, **kwargs) -> Any:
        """Invokes the original method

        Returns:
            Any: Return value of the original method.
        """
        input_key = "{}:inputs".format(method.__qualname__)
        output_key = "{}:outputs".format(method.__qualname__)
        output = method(self, *args, **kwargs)
        if isinstance(self._redis, Redis):
            self._redis.rpush(input_key, str(args))
            self._redis.rpush(output_key, output)
        return output
    return invoker

def replay(fn: Callable) -> None:
    '''Displays the call history of a Cache class' method.
    '''
    if fn is None or not hasattr(fn, '__self__'):
        return
    redis_store = getattr(fn.__self__, '_redis', None)
    if not isinstance(redis_store, Redis):
        return
    fxn_name = fn.__qualname__
    in_key = '{}:inputs'.format(fxn_name)
    out_key = '{}:outputs'.format(fxn_name)
    fxn_call_count = 0
    if redis_store.exists(fxn_name) != 0:
        fxn_call_count = int(redis_store.get(fxn_name))
    print('{} was called {} times:'.format(fxn_name, fxn_call_count))
    fxn_inputs = redis_store.lrange(in_key, 0, -1)
    fxn_outputs = redis_store.lrange(out_key, 0, -1)
    for fxn_input, fxn_output in zip(fxn_inputs, fxn_outputs):
        print('{}(*{}) -> {}'.format(
            fxn_name,
            fxn_input.decode("utf-8"),
            fxn_output,
        ))

class Cache:
    """
        A redis storage for caching API responses.
    """

    def __init__(self) -> None:
        """Instantiates the cache object."""
        if os.environ.get('ENV') != 'local':
            pool = ConnectionPool(host=redis_host, port=redis_port, decode_responses=True)
            self._redis = Redis(connection_pool=pool)
        else:
            pool = ConnectionPool(decode_responses=True)
            self._redis = Redis(connection_pool=pool)
        self._redis.flushdb(True)

    @count_calls
    @call_history
    def set(self, key: str, data: str, expire: int = None) -> str:
        """Stores database object into the redis cache

        Args:
            data: Object to cache

        Returns:
            str: ID of the object stored
        """
        try:
            self._redis.set(key, data, ex=expire)
        except Exception as e:
            print(f"Error setting key {key}: {e}")

        return key

    def get(self, key: str) -> Union[str, bytes, int, float]:
        """Retrieves the value of a key from the cache

        Args:
            key (str): The key whose value we want to retrieve

        Returns:
            Union[str, bytes, int, float]: Possible return types
        """
        cache_response = self._redis.get(key)

        if cache_response:
            cache_response = json.loads(cache_response)
            data = cache_response.get('data')
            if data and 'timestamp' in data[0].keys():
                # Convert the timestamp string to datetime
                for obj in cache_response['data']:
                    obj['timestamp'] = dt.fromisoformat(obj['timestamp'])
        
        return cache_response

    
    def flush(self):
        """Remove all cached data.
        """
        self._redis.flushdb(True)
