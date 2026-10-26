"""Validation-only overrides; production settings and dependency pins stay intact.

Daphne's server imports fail with the available OpenSSL/cryptography combination.
HTTP/ORM tests use Django's test client; they do not need a Daphne server.
"""
from canteen.settings import *

INSTALLED_APPS = [app for app in INSTALLED_APPS if app != 'daphne']
DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
# Only the payment client constructed at URL import is mocked by this wrapper.
# No assignment view, policy, ORM operation, or channel layer is mocked globally.
ROOT_URLCONF = 'ch01_test_urls'
