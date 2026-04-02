dev:
	docker compose --env-file .env.development -f docker-compose.dev.yml up --build

dev-down:
	docker compose -f docker-compose.dev.yml down

dev-migrate:
	docker compose -f docker-compose.dev.yml exec app yarn db:migrate

prod:
	docker compose -f docker-compose.prod.yml up --build -d

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-migrate:
	docker compose -f docker-compose.prod.yml exec app yarn db:migrate
