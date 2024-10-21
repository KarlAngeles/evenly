.PHONY: *

build:
	docker build -t evenly-backend-local -f backend/Dockerfile.development .
	docker build -t evenly-frontend-local -f frontend/Dockerfile.development .
	docker image prune -f

start:
	docker-compose -f docker-compose-development.yml up

stop:
	docker-compose -f docker-compose-development.yml down

console:
	docker exec -it evenly-backend-local bash