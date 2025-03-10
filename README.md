# timeboxing-microservices
all released microservices to time boxing 

## Step to not forget 
# timeboxing-microservices
all released microservices to time boxing 

## Step to not forget 
install justfile 
```sh
brew install just
```
## How to kill running process 
```sh
lsof -i :3000
kill -9 PID
```


## Structure 
hexagonal-nest/
├── src/
│   ├── core/                 # 💡 Pure business logic (independent of NestJS)
│   │   ├── domain/           # Entities, Value Objects, Aggregates
│   │   ├── ports/            # Interfaces (Repository, Service, etc.)
│   │   ├── usecases/         # Application logic (Use Cases)
│   ├── infrastructure/       # 💡 Implements the core's required dependencies
│   │   ├── repository/       # Database repository implementations
│   │   ├── services/         # External APIs, Cache, Messaging
│   ├── api/                  # 💡 NestJS-Specific (Controllers, DTOs)
│   ├── config/               # Configuration files (env, DB, Redis, etc.)
│   ├── main.ts               # NestJS entry point
│   ├── app.module.ts         # Root module
├── test/                     # Unit and integration tests
│   ├── unit/
│   ├── integration/
