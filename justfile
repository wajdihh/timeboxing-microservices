#!/usr/bin/env just

# Default command
default:
  echo "Run 'just --list' to see available commands"

# Build all services
build:
  docker-compose -f infra/docker/docker-compose.yml build

# Start services in a selected environment (e.g., "just up watch / debug")
up env:
  @echo "Checking if Docker is running..."
  @docker info > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker and try again."; exit 1; }
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.{{env}}.yml up -d


# Stop all services
down:
  docker-compose -f infra/docker/docker-compose.yml down --remove-orphans

# Restart a specific service (e.g., "just restart identity-service")
restart service:
  docker-compose -f infra/docker/docker-compose.yml restart {{service}}

# Clean up Docker
clean:
  docker-compose -f infra/docker/docker-compose.yml down -v --remove-orphans && docker system prune -f

# Start a specific service in a selected environment (e.g., "just start identity-service dev")
start service env:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.{{env}}.yml up -d {{service}}

# View logs for a specific service (e.g., "just logs identity-service")
logs service:
  docker-compose -f infra/docker/docker-compose.yml logs -f {{service}}

# View logs for all services
logs-all:
  docker-compose -f infra/docker/docker-compose.yml logs -f

# Enter in Exec cmd inside the container (e.g., "just exec identity-service")
exec service:
  docker exec -it {{service}} sh