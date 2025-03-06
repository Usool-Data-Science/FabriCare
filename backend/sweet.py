import os
import click
import logging
from logging.handlers import RotatingFileHandler, SMTPHandler

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
        if num and num > 0:
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
        else:
            users(0)
    except Exception as e:
        print("Error: {}".format(e))

if not app.debug:
    # Ensure the logs directory exists
    if not os.path.exists('logs'):
        os.mkdir('logs')

    # File Error Logging
    file_handler = RotatingFileHandler('logs/sweetlatex.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)

    # SMTP Error Logging (Email Notifications)
    if app.config.get('MAIL_SERVER'):
        auth = None
        if app.config.get('MAIL_USERNAME') or app.config.get('MAIL_PASSWORD'):
            auth = (app.config.get('MAIL_USERNAME'), app.config.get('MAIL_PASSWORD'))
        secure = None
        if app.config.get('MAIL_USE_TLS'):
            secure = ()

        mail_handler = SMTPHandler(
            mailhost=(app.config.get('MAIL_SERVER'), app.config.get('MAIL_PORT')),
            fromaddr=f"no-reply@{app.config.get('MAIL_SERVER')}",
            toaddrs=app.config.get('ADMINS'),
            subject='Application Failure',
            credentials=auth,
            secure=secure
        )
        mail_handler.setLevel(logging.ERROR)
        app.logger.addHandler(mail_handler)

    # Set the logger's level to INFO for file logs and ERROR for email logs
    app.logger.setLevel(logging.INFO)
    app.logger.info('Application startup complete')
