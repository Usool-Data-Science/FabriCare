import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Database configuration
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_name = os.getenv("DB_NAME")

ssl_ca = os.getenv("SSL_CA")
ssl_cert = os.getenv("SSL_CERT")
ssl_key = os.getenv("SSL_KEY")

DATABASE_URL = None

if os.environ.get('ENV') != 'local':
    DATABASE_URL = (
        f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    )
else:
    DATABASE_URL = os.environ.get('DATABASE_URL')


def as_bool(value):
    """
    Converts a string to a boolean value.
    Returns False if the value is None or cannot be interpreted as True.
    """
    if value:
        return value.lower() in ['true', 'yes', 'on', '1']
    return False


class Config:
    """Application configuration class."""

    SQLALCHEMY_DATABASE_URI = (
        DATABASE_URL or 'sqlite:///' + os.path.join(BASE_DIR, 'sweet.db')
    )
    SECRET_KEY = os.environ.get('SECRET_KEY', 'fabricarescretkey!')
    FRONTEND_BASE_URL = os.environ.get('FRONTEND_BASE_URL', 'http://localhost:3000')

    # Security options
    DISABLE_AUTH = as_bool(os.environ.get('DISABLE_AUTH'))
    ACCESS_TOKEN_MINUTES = int(os.environ.get('ACCESS_TOKEN_MINUTES') or '15')
    REFRESH_TOKEN_DAYS = int(os.environ.get('REFRESH_TOKEN_DAYS') or '7')
    REFRESH_TOKEN_IN_COOKIE = as_bool(
        os.environ.get('REFRESH_TOKEN_IN_COOKIE') or 'yes'
    )
    REFRESH_TOKEN_IN_BODY = as_bool(os.environ.get('REFRESH_TOKEN_IN_BODY'))
    RESET_TOKEN_MINUTES = int(os.environ.get('RESET_TOKEN_MINUTES') or '15')
    PASSWORD_RESET_URL = os.environ.get('PASSWORD_RESET_URL') or \
        'http://localhost:4000/reset'
    USE_CORS = as_bool(os.environ.get('USE_CORS') or 'yes')
    CORS_SUPPORTS_CREDENTIALS = True

    # OAuth2 providers configuration
    OAUTH2_PROVIDERS = {
        'google': {
            'client_id': os.environ.get('GOOGLE_CLIENT_ID'),
            'client_secret': os.environ.get('GOOGLE_CLIENT_SECRET'),
            'authorize_url': 'https://accounts.google.com/o/oauth2/auth',
            'access_token_url': 'https://accounts.google.com/o/oauth2/token',
            'get_user': {
                'url': 'https://www.googleapis.com/oauth2/v3/userinfo',
                'email': lambda json: json['email'],
            },
            'scopes': ['https://www.googleapis.com/auth/userinfo.email'],
        },
        'github': {
            'client_id': os.environ.get('GITHUB_CLIENT_ID'),
            'client_secret': os.environ.get('GITHUB_CLIENT_SECRET'),
            'authorize_url': 'https://github.com/login/oauth/authorize',
            'access_token_url': 'https://github.com/login/oauth/access_token',
            'get_user': {
                'url': 'https://api.github.com/user/emails',
                'email': lambda json: json[0]['email'],
            },
            'scopes': ['user:email'],
        },
    }
    OAUTH2_REDIRECT_URI = os.environ.get('OAUTH2_REDIRECT_URI') or \
        'http://localhost:3000/oauth2/{provider}/callback'

    # API documentation
    APIFAIRY_TITLE = 'Fabricare API'
    APIFAIRY_VERSION = '1.0'
    APIFAIRY_UI = os.environ.get('DOCS_UI', 'rapidoc')
    APIFAIRY_TAGS = ['tokens', 'users', 'carts', 'artists', 'products']

    # Email options
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'localhost')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or '25')
    MAIL_USE_TLS = as_bool(os.environ.get('MAIL_USE_TLS'))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get(
        'MAIL_DEFAULT_SENDER', 'donotreply@fabricare.com'
    )

    # Media and file options
    CAROUSEL_SIZE = int('3')
    MEDIA_PATH = os.path.join(BASE_DIR, 'media')
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
    ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif']
