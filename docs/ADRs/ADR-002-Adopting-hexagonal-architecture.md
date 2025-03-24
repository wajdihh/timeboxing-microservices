

# ✅ ADR-002: Hexagonal Architecture & Naming Conventions

## 🎯 Decision

We adopt **Hexagonal Architecture (Ports & Adapters)** for all microservices, with standardized **file naming conventions** aligned with the **NestJS + TypeScript community**.

This architecture separates the system into:

---

### 🟩 1. Domain Layer
- **What:** Core business logic (entities, rules, value objects)
- **No NestJS, DB, or HTTP dependencies**
- **File Naming:** `PascalCase.ts`

**Examples:**
```plaintext
Task.ts                          → class Task  
TaskRepository.ts                → interface TaskRepository  
TaskStatus.ts                    → enum TaskStatus  
InvalidTaskStatusException.ts    → class InvalidTaskStatusException  
```

---

### 🟦 2. Application Layer
- **What:** Use-case orchestration, domain coordination, and external port definitions
- **File Naming:**  
  - Use-case services: `PascalCaseService.ts`  
  - Ports (non-persistence): `PascalCasePort.ts`  
  - DTOs: `PascalCaseDto.ts`

**Examples:**
```plaintext
CreateTaskService.ts            → class CreateTaskService  
NotificationPort.ts             → interface NotificationPort  
CreateTaskRequestDto.ts         → interface CreateTaskRequestDto  
```

---

### 🟥 3. Infrastructure Layer
- **What:** NestJS controllers, DB adapters, external service clients
- **File Naming:** `PascalCaseSuffix.ts` (e.g., `TaskController.ts`, `PrismaTaskRepository.ts`, `EmailNotificationAdapter.ts`)

**Examples:**
```plaintext
TaskController.ts               → class TaskController  
PrismaTaskRepository.ts         → class PrismaTaskRepository implements TaskRepository  
EmailNotificationAdapter.ts     → class EmailNotificationAdapter implements NotificationPort  
```

---

## Flow

Depending on the purpose of the interaction, the application service can route to either a **Domain Repository** or an **Application Port**:

```plaintext
📦 Controller
   ↓
📘 Application Service
   ↓
1️⃣ Domain Port (e.g., TaskRepository)
   ↓
🔌 Infrastructure Adapter (e.g., PrismaTaskRepository)
   ↓
🗄️ External System (e.g., DB)

OR

2️⃣ Application Port (e.g., NotificationPort)
   ↓
🔌 Infrastructure Adapter (e.g., EmailNotificationAdapter)
   ↓
🌍 External System (e.g., Mailgun)
```

| Case                          | Port Type         | Example                                |
|------------------------------|-------------------|----------------------------------------|
| Domain persistence (Tasks)   | Domain Repository | `TaskRepository → PrismaTaskRepository`|
| Side-effects (Email, Stripe) | Application Port  | `NotificationPort → EmailNotificationAdapter`|

---

## 📁 Recommended Folder Structure

```plaintext
src/
├── domain/
│   ├── entities/                → Task.ts
│   ├── repositories/            → TaskRepository.ts
│   ├── value-objects/           → TaskStatus.ts
│   └── exceptions/              → InvalidTaskStatusException.ts

├── application/
│   ├── services/                → CreateTaskService.ts
│   ├── dto/                     → CreateTaskRequestDto.ts
│   └── ports/                   → NotificationPort.ts

└── infrastructure/
    ├── controllers/
    │   ├── rest/                → TaskController.ts
    │   └── sockets/             → TaskSocketGateway.ts
    ├── adapters/
    │   ├── database/            → PrismaTaskRepository.ts
    │   └── external-services/   → EmailNotificationAdapter.ts
    └── config/                  → AppModule.ts
```

---

## ✅ Summary Table

| Layer          | File Name Example              | Class/Interface             | Purpose                      |
|----------------|--------------------------------|-----------------------------|------------------------------|
| Domain         | `TaskRepository.ts`            | `interface TaskRepository`  | Persistence port             |
| Application    | `NotificationPort.ts`          | `interface NotificationPort`| External system port         |
| Application    | `CreateTaskService.ts`         | `CreateTaskService`         | Use-case logic               |
| Infrastructure | `PrismaTaskRepository.ts`      | `PrismaTaskRepository`      | Implements domain repository |
| Infrastructure | `EmailNotificationAdapter.ts`  | `EmailNotificationAdapter`  | Implements application port  |

---
