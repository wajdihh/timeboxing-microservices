# ADR 001: Monorepo Structure & Shared Packages

## Context
We opted for a monorepo to streamline sharing common packages, reduce duplication, and enable easy versioning.

## Decision
Use **Nx** or **TurboRepo** for monorepo management.
Organize shared libraries under `/libs` and microservices under `/microservices`.

## Structure Example:
- /libs
  - /loging
  - /core
  - /auth
  - /database
- /services
  - /identity-service
  - /task-service
  - /billing-service

## Consequences
- Easily share models, interfaces, and utilities.
- Consistency across microservices is enforced.

