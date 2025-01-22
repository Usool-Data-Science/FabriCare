#!/bin/bash
flask db upgrade head
flask fakes create 5
exec gunicorn -b :5000 --access-logfile - --error-logfile - sweet:app
