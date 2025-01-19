# This module implements safe replacements for the deprecated datetime.utcnow()
# function of the Python standard library.
# For details see this blog post:
# https://blog.miguelgrinberg.com/post/it-s-time-for-a-change-datetime-utcnow-is-now-deprecated

from datetime import datetime, timezone


def aware_utcnow():
    """
        Return UTC version of current date and time
        E.g. 2024-11-30 13:44:49.047975+00:00
    """
    return datetime.now(timezone.utc)


def naive_utcnow():
    """
        Used instead of datetime.now, to ensure utc is captured
        but not returned
    """
    return aware_utcnow().replace(tzinfo=None)
