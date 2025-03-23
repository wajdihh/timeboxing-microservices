# ADR-002: Adopting Hexagonal Architecture (Ports & Adapters)

## Context
Our microservices must be maintainable, easily testable, and adaptable to changing business requirements.

## Decision
We adopt **Hexagonal Architecture (Ports & Adapters)** for structuring our microservices. This architectural pattern clearly separates core domain logic from external dependencies such as databases, message brokers, web APIs, and UI frameworks.

The architecture consists of three primary layers:

### 1. Domain Layer
- Contains pure business logic, entities, domain rules, and validations.
- Includes interfaces (ports) defining data persistence contracts.
- No direct dependencies on infrastructure or external services.

### 2. Application Layer
- Defines and orchestrates use-cases or services representing business scenarios.
- Contains DTOs (Data Transfer Objects) for transferring data between layers.
- Defines interfaces (ports) for external interactions (e.g., email services, external APIs).

### 3. Infrastructure Layer
- Implements external interactions, including persistence and external service integrations.
- Contains adapters implementing interfaces defined by the Domain and Application layers.
- Hosts controllers handling inbound requests (REST, GraphQL, WebSocket).

### Recommended Folder Structure

```plaintext
src/
├── domain/
│   ├── entities/
│   ├── repositories/
│   ├── value-objects/
│   └── exceptions/
│
├── application/
│   ├── services/
│   ├── dto/
│   └── interfaces/
│
└── infrastructure/
    ├── controllers/
    │   ├── rest/
    │   └── sockets/
    ├── adapters/
    │   ├── database/
    │   └── external-services/
    └── config/
```

### DTOs Best Practices

- ✅ **Define DTOs explicitly** in the Application layer.
- ✅ **Controllers (Infrastructure)** clearly convert external requests to DTOs.
- ✅ **Application services** use DTOs explicitly as structured input/output.
- ✅ **Domain stays clean**: Never directly use DTOs in Domain entities or logic.

## Consequences
- Clear separation between domain logic and infrastructure concerns, improving maintainability and flexibility.
- Enhanced testability as domain and application layers can be independently unit-tested and mocked.
- Infrastructure can evolve without impacting domain logic, facilitating easier adaptations to technology changes.

