# ✅ ADR-003: Data Transfer Objects (DTO) Usage

## Context
Our microservices follow Hexagonal Architecture, clearly separating Domain, Application, and Infrastructure layers. To maintain this clarity and avoid tight coupling between layers, we need a standardized and explicit way to transfer data between these layers.

## Decision
We adopt explicit use of **Data Transfer Objects (DTOs)** to transfer data between layers, following these clear guidelines:

### 1. DTO Definition
- DTOs are simple, immutable data structures containing only data (no business logic).
- Clearly defined within the Application layer.

### 2. Layer Responsibilities

#### 🔹 Domain Layer
- Contains pure domain entities and business logic only.
- **Never directly depends on or references DTOs.**

#### 🔹 Application Layer
- Explicitly defines DTOs for incoming requests and outgoing responses (PascalCase).
- Handles explicit conversion between DTOs and Domain entities.

#### 🔹 Infrastructure Layer
- Uses DTOs for all external interactions (HTTP requests/responses, messaging).
- Never directly exposes or consumes Domain entities externally.

### 3. DTO Types

- **Request DTOs**: Represent incoming external data clearly (minimal and explicitly structured).
  - Examples: `CreateTaskDto`, `UpdateTaskDto`, `GetTaskDto`

- **Response DTOs**: Represent data explicitly structured for external output (often excluding sensitive or irrelevant internal fields).
  - Examples: `TaskResponseDto`, `UserProfileDto`

### 4. Recommended Project Structure
```
src/
├── domain/
│   └── entities/
│
├── application/
│   ├── services/
│   └── dto/
│       ├── requests/
│       │   ├── createTaskDto.ts
│       │   └── updateTaskDto.ts
│       └── responses/
│           └── taskResponseDto.ts
│
└── infrastructure/
    └── controllers/
```

### 5. Example Usage

#### **Incoming DTO to Domain Entity Conversion**:
```typescript
// application/services/task.service.ts
async createTask(dto: CreateTaskDto): Promise<TaskResponseDto> {
  const taskEntity = TaskEntity.create(dto.title, dto.description);
  const savedTask = await repository.save(taskEntity);

  return TaskResponseDto.fromEntity(savedTask);
}
```

#### **Domain Entity to Outgoing DTO Conversion**:
```typescript
// application/dto/responses/taskResponseDto.ts
static fromEntity(entity: TaskEntity): TaskResponseDto {
  return {
    id: entity.id,
    title: entity.title,
    description: entity.description,
    createdAt: entity.createdAt,
  };
}
```
