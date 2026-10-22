.PHONY: up down migrate reset-demo test
up:
	docker compose up --build
down:
	docker compose down
migrate:
	docker compose run --rm api alembic upgrade head
reset-demo:
	docker compose run --rm api python seed_demo.py
test:
	docker compose run --rm api pytest
