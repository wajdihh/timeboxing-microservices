# ✅ ADR-006: Swagger Integration via Use Case Metadata

## Context

To ensure consistent and automated API documentation across all microservices, Swagger decorators must be declarative, reusable, and driven by metadata. This includes:

* Request DTOs
* Response DTOs
* Domain errors
* Success HTTP codes (e.g. 200, 201, 204)
* NestJS validation errors (400)

Manually decorating each controller method leads to duplication, error drift, and coupling. A central strategy was required.

## Decision

We introduced:

* `@UseCaseMetadata()` — defines the contract on the use case class
* `@SwaggerUseCase()` — reads the metadata and generates the corresponding Swagger decorators

### 1. `@UseCaseMetadata`

Defines contract-level metadata:

```ts
@UseCaseMetadata({
  request: RegisterUserRequestDto,
  response: UserResponseDto,
  errors: [InvalidEmailError, UserAlreadyExistsError],
  successStatus: DomainHttpCode.CREATED,
})
```

### 2. `@SwaggerUseCase`

Extracts metadata and applies:

* `@ApiBody()` with sample request
* `@ApiResponse()` for success response
* `@ApiResponse()` for each domain error
* `@ApiResponse(400)` for ValidationPipe errors

### 3. Central Swagger Setup

To enable Swagger in a microservice, we use a shared utility under `@timeboxing/shared`. In each `main.ts`, we simply call:

```ts
setupSwagger(app, {
  path: 'api',
  title: 'Identity Service',
  description: 'Handles user registration, login, and authentication',
  version: '1.0.0',
});
```

This avoids boilerplate and ensures consistent Swagger UI configuration across all services.

## Consequences

* ✅ Unified, DRY Swagger across microservices
* ✅ Fully declarative and metadata-driven
* ✅ Keeps controller logic clean
* ✅ Supports ValidationPipe and domain errors out of the box
* ❌ Requires `.sample()` on DTOs for examples
