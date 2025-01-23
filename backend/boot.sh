#!/bin/bash
if [ -d "migrations" ]; then
    echo "Migrations folder found. Running flask db upgrade head..."
    while true; do
        flask db upgrade head
        # flask fakes create 5    # No need to populate again.
        if [[ "$?" == "0" ]]; then
            echo "Upgrade and fakes creation successful."
            break
        fi
        echo "Upgrade command failed, retrying in 5 seconds..."
        sleep 5
    done
else
    echo "Migrations folder not found. Creating a new migration..."
    flask db init
    flask db migrate -m "Instantiate db"
    while true; do
        flask db upgrade
        flask fakes create 5
        if [[ "$?" == "0" ]]; then
            echo "Upgrade and fakes creation successful."
            break
        fi
        echo "Upgrade command failed, retrying in 5 seconds..."
        sleep 5
    done
fi
exec gunicorn -b :5000 --workers 3 --access-logfile - --error-logfile - sweet:app
