#!/bin/sh
set -e

cd /app/src

if [ "$1" = "migrate" ]; then
    python manage.py migrate --noinput
    exit 0
fi

python manage.py migrate --noinput
python manage.py collectstatic --noinput

exec python manage.py runserver 0.0.0.0:8090
