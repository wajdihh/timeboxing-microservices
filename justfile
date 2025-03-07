#!/usr/bin/env just

# Define a default command
default:
  echo "Run 'just --list' to see available commands"

# Build all Docker containers
build:
  docker-compose -f infra/docker/docker-compose.yml build

# Start services
up:
  @echo "Checking if Docker is running..."
  @docker info > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker and try again."; exit 1; }
  docker-compose -f infra/docker/docker-compose.yml up -d

# Stop services
down:
  docker-compose -f infra/docker/docker-compose.yml down --remove-orphans

# Restart a specific service (e.g., "just restart identity-service")
restart service:
  docker-compose -f infra/docker/docker-compose.yml restart {{service}}

# Clean up Docker
clean:
  docker-compose -f infra/docker/docker-compose.yml down -v --remove-orphans && docker system prune -f
