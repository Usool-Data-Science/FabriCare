"""Instantiate db

Revision ID: 8d4e02586ff3
Revises: 
Create Date: 2025-01-19 11:01:51.953302

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8d4e02586ff3'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('artists',
    sa.Column('name', sa.String(length=64), nullable=False),
    sa.Column('image', sa.String(length=1000), nullable=True),
    sa.Column('description', sa.String(), nullable=True),
    sa.Column('website', sa.String(length=500), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name')
    )
    with op.batch_alter_table('artists', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_artists_timestamp'), ['timestamp'], unique=False)

    op.create_table('users',
    sa.Column('first_name', sa.String(length=50), nullable=False),
    sa.Column('last_name', sa.String(length=50), nullable=False),
    sa.Column('username', sa.String(length=64), nullable=True),
    sa.Column('email', sa.String(length=150), nullable=False),
    sa.Column('date_joined', sa.DateTime(), nullable=False),
    sa.Column('password_hash', sa.String(length=250), nullable=True),
    sa.Column('first_seen', sa.DateTime(), nullable=False),
    sa.Column('last_seen', sa.DateTime(), nullable=False),
    sa.Column('role', sa.String(length=50), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_users_date_joined'), ['date_joined'], unique=False)
        batch_op.create_index(batch_op.f('ix_users_timestamp'), ['timestamp'], unique=False)
        batch_op.create_index(batch_op.f('ix_users_username'), ['username'], unique=True)

    op.create_table('orders',
    sa.Column('price', sa.Float(), nullable=False),
    sa.Column('status', sa.String(length=100), nullable=False),
    sa.Column('payment_id', sa.String(length=100), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_orders_customer_id'), ['customer_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_orders_timestamp'), ['timestamp'], unique=False)

    op.create_table('products',
    sa.Column('title', sa.String(length=84), nullable=False),
    sa.Column('deadline', sa.Integer(), nullable=False),
    sa.Column('artist_name', sa.String(), nullable=False),
    sa.Column('goal', sa.Integer(), nullable=False),
    sa.Column('mainImage', sa.String(length=500), nullable=True),
    sa.Column('subImages', sa.JSON(), nullable=True),
    sa.Column('composition', sa.String(length=256), nullable=True),
    sa.Column('color', sa.String(length=256), nullable=True),
    sa.Column('style', sa.String(length=256), nullable=True),
    sa.Column('price', sa.Integer(), nullable=True),
    sa.Column('quantity', sa.Integer(), nullable=True),
    sa.Column('sizes', sa.JSON(), nullable=True),
    sa.Column('artist_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['artist_id'], ['artists.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_products_artist_id'), ['artist_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_products_timestamp'), ['timestamp'], unique=False)
        batch_op.create_index(batch_op.f('ix_products_title'), ['title'], unique=True)

    op.create_table('tokens',
    sa.Column('access_token', sa.String(length=64), nullable=False),
    sa.Column('access_expiration', sa.DateTime(), nullable=False),
    sa.Column('refresh_token', sa.String(length=64), nullable=False),
    sa.Column('refresh_expiration', sa.DateTime(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('tokens', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_tokens_access_token'), ['access_token'], unique=False)
        batch_op.create_index(batch_op.f('ix_tokens_refresh_token'), ['refresh_token'], unique=False)
        batch_op.create_index(batch_op.f('ix_tokens_timestamp'), ['timestamp'], unique=False)
        batch_op.create_index(batch_op.f('ix_tokens_user_id'), ['user_id'], unique=False)

    op.create_table('carts',
    sa.Column('quantity', sa.Integer(), nullable=False),
    sa.Column('customer_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('timestamp', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('carts', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_carts_customer_id'), ['customer_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_carts_product_id'), ['product_id'], unique=False)
        batch_op.create_index(batch_op.f('ix_carts_timestamp'), ['timestamp'], unique=False)

    op.create_table('order_products',
    sa.Column('order_id', sa.Integer(), nullable=False),
    sa.Column('product_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['product_id'], ['products.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('order_id', 'product_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('order_products')
    with op.batch_alter_table('carts', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_carts_timestamp'))
        batch_op.drop_index(batch_op.f('ix_carts_product_id'))
        batch_op.drop_index(batch_op.f('ix_carts_customer_id'))

    op.drop_table('carts')
    with op.batch_alter_table('tokens', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_tokens_user_id'))
        batch_op.drop_index(batch_op.f('ix_tokens_timestamp'))
        batch_op.drop_index(batch_op.f('ix_tokens_refresh_token'))
        batch_op.drop_index(batch_op.f('ix_tokens_access_token'))

    op.drop_table('tokens')
    with op.batch_alter_table('products', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_products_title'))
        batch_op.drop_index(batch_op.f('ix_products_timestamp'))
        batch_op.drop_index(batch_op.f('ix_products_artist_id'))

    op.drop_table('products')
    with op.batch_alter_table('orders', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_orders_timestamp'))
        batch_op.drop_index(batch_op.f('ix_orders_customer_id'))

    op.drop_table('orders')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_users_username'))
        batch_op.drop_index(batch_op.f('ix_users_timestamp'))
        batch_op.drop_index(batch_op.f('ix_users_date_joined'))

    op.drop_table('users')
    with op.batch_alter_table('artists', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_artists_timestamp'))

    op.drop_table('artists')
    # ### end Alembic commands ###