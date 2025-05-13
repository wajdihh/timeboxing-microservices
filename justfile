#!/usr/bin/env just

# Default command
default:
  @just --list

# Build all services
build:
  # Build Docker containers
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample build

# Build a specific service (e.g., "just build identity-service")
build-service service:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample build {{service}}

# Start all services in a selected environment (e.g., "local by default or add arg like dev, staging, prod" eg.. "just up")
up env='local':
  @echo "Checking if Docker is running..."
  @docker info > /dev/null 2>&1 || { echo " Docker is not running. Please start Docker and try again."; exit 1; }

  @echo "🐳 Starting infrastructure (Postgres, Grafana, Prometheus)..."
  NODE_ENV={{env}} docker-compose \
    -f infra/docker/docker-compose.yml \
    -f infra/docker/docker-compose.override.yml \
    --env-file infra/docker/.env.{{env}} \
    up --build -d postgres grafana prometheus cadvisor redis

  @echo "🚀 Starting identity-service locally with NODE_ENV={{env}}"
  #Run the identity-service locally
  cd microservices/identity-service && NODE_ENV={{env}} npm run start:dev


# Start services in a selected environment (e.g., "local by default or add arg like dev, staging, prod" eg.. "just up-service identity-service")
up-service service env='local':
  @echo "Checking if Docker is running..."
  @docker info > /dev/null 2>&1 || { echo "Docker is not running. Please start Docker and try again."; exit 1; }
  NODE_ENV={{env}} docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.{{env}} up -d {{service}}

# Stop all services
down:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample down --remove-orphans

# Restart a specific service (e.g., "just restart-service identity-service")
restart-service service env='local':
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.{{env}} restart {{service}} && docker-compose -f infra/docker/docker-compose.yml --env-file infra/docker/.env.{{env}} logs -f {{service}}

# Clean up Docker
clean:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample down -v --remove-orphans && docker system prune -f && docker image prune -f

# Clean up NPM
clean-npm:
  rm -rf node_modules package-lock.json
  rm -rf libs/node_modules
  rm -rf microservices/identity-service/node_modules
  npm cache clean --force

# Install NPM packages
install-npm:
  npm install --legacy-peer-deps
  npm run build

# Clean a specific service (remove containers and images) e.g., "just clean-service identity-service")
clean-service service:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample down -v --remove-orphans {{service}} && docker system prune -f && docker image prune -f

# Start a specific service in a selected environment (e.g., "just start-service identity-service")
start-service service env='local':
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.{{env}} up -d {{service}}

# Stop a specific service in a selected environment (e.g., "just stop-service identity-service")
stop-service service env='local':
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.{{env}} down {{service}}

# View logs for a specific service (e.g., "just logs-service identity-service")
logs-service service:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample logs -f {{service}}

# View logs for all services eg. (e.g., "just logs-all")
logs-all:
  docker-compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml --env-file infra/docker/.env.sample logs -f

# Enter in Exec cmd inside the container (e.g., "just exec-service identity-service")
exec-service service:
  docker exec -it {{service}} sh

# git push -f origin main
push force:
  git push -f origin main

# reset local env by deleting node_modules + docker images + clean")
reset:
  rm -rf node_modules libs/node_modules
  just clean
  docker rmi -f $(docker images -q)
  

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
