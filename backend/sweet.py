import click

from api.app import create_app
from api.utilities import users, artists, products, orders, carts
app = create_app()


@app.cli.group()
def fakes():
    """Generating fake objects"""
    pass

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
        print("Creating {} users, {} artists, {} products, {} orders and {} carts.".format(
            num, artist_count, products_count, orders_count, carts_count
        ))
        users(num)
        artists(artist_count)
        products(products_count)
        orders(orders_count)
        carts(carts_count)
    except Exception as e:
        print("Error: {}".format(e))