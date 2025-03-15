#!/usr/bin/env just

# Default command
default:
  @just --list

# Build all services
build:
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.sample build

# Start services in a selected environment (e.g., "just up (default local) or add arg like dev, staging, prod")
up env='local':
  @echo "Checking if Docker is running..."
  @docker info > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker and try again."; exit 1; }
  NODE_ENV={{env}} docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.{{env}} up -d

# Stop all services
down:
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.sample down --remove-orphans

# Restart a specific service (e.g., "just restart identity-service (default local) or add arg like dev, staging, prod" )
restart service env='local':
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.{{env}} restart {{service}}

# Clean up Docker
clean:
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.sample down -v --remove-orphans && docker system prune -f && docker image prune -f

# Start a specific service in a selected environment (e.g., "just start identity-service (default local) or add arg like dev, staging, prod")
start service env='local':
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.{{env}} up -d {{service}}

# Stop a specific service in a selected environment (e.g., "just stop identity-service (default local) or add arg like dev, staging, prod")
stop service env='local':
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.{{env}} down {{service}}

# View logs for a specific service (e.g., "just logs identity-service")
logs service:
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.sample logs -f {{service}}

# View logs for all services
logs-all:
  docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.sample logs -f

# Enter in Exec cmd inside the container (e.g., "just exec identity-service")
exec service:
  docker exec -it {{service}} sh

# Security scanning
scan:
  # Install Trivy if not already installed
  @if ! command -v trivy &> /dev/null; then \
    echo "Installing Trivy..."; \
    brew install aquasecurity/trivy/trivy; \
  fi
  
  # Scan for vulnerabilities in dependencies
  npm audit --production
  
  # Scan Docker images for vulnerabilities using Trivy
  @for image in $(docker images -q); do \
    echo "Scanning image $image..."; \
    trivy image --severity HIGH,CRITICAL $image; \
  done
  
  # Static code analysis
  npm run lint:security
  
  # Check for secrets in code
  detect-secrets scan --all-files
