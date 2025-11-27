#!/bin/sh
set -e

cd /app/src

if [ "$1" = "migrate" ]; then
    python manage.py migrate --noinput
    exit 0
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec gunicorn web_aplication.wsgi:application --bind 0.0.0.0:8090 --workers 3
