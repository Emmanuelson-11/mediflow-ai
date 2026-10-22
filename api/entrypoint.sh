#!/bin/sh
set -eu

alembic upgrade head
python seed_demo.py
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
