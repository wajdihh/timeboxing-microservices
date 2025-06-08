# ✅ ADR-007:TimeBoxing Testing Strategy

This document outlines the **testing strategy** for all microservices in the TimeBoxing project, aligned with **DDD** and **Hexagonal Architecture** principles. It includes **ADR-008** to formalize our decision-making.  

---

## 🎯 Purpose  

✅ Ensure **high-quality, maintainable code**  
✅ Validate both **internal logic** and **user-facing features**  
✅ Support safe refactoring and robust infrastructure  

---

## 🔎 Testing Methodologies  

We adopt a combination of **Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD/E2E)**.

| **Layer**             | **Methodology**            | **Scope**                          | **Test Type** | **Coverage Goal** | **Tools**                 |
|-----------------------|----------------------------|------------------------------------|---------------|--------------------|---------------------------|
| **Domain Layer**      | TDD                        | Entities, Value Objects, Domain Services | Unit          | 💯                  | Jest, Mocha/Chai          |
| **Application Layer** | TDD                        | UseCases, Orchestration            | Unit          | ≥ 90%              | Jest, Mocha/Chai          |
| **Infrastructure Layer** | Integration Tests (optional TDD) | Adapters, DB, Redis        | Integration   | ≥ 80%              | Jest + Testcontainers     |
| **API Layer**         | BDD/E2E                    | API Endpoints, Workflows           | E2E           | ≥ 70%              | Supertest, Cypress        |

---

## 🔄 TDD Workflow  

1️⃣ Write a **failing test first**  
2️⃣ Implement the **minimum code** to pass  
3️⃣ Refactor and ensure clean architecture  

---

## 🚀 BDD/E2E Workflow  

✅ Write tests describing **expected user behavior** (e.g., API endpoints).  
✅ Validate end-to-end workflows from API to infrastructure.  
✅ Focus on **real-world usage** and **acceptance criteria**.  

---

## 🗂️ Folder Structure  
- /test/unit/            → TDD: Domain & Application
- /test/integration/     → Integration: Adapters, DB, Redis
- /test/e2e/             → BDD/E2E: API Workflows

---

## 🛠️ Guidelines  

- **Use mocks** for dependencies in unit tests.  
- **Use real dependencies** for integration tests (Testcontainers/Docker Compose).  
- Integrate test coverage into CI pipelines.  
- Enforce coverage thresholds per layer:
  - Domain: 💯
  - Application: ≥ 90%
  - Infrastructure: ≥ 80%
  - API/E2E: ≥ 70%

---

## 📌 Benefits  

✅ Clean, testable code aligned with business needs  
✅ Early feedback and reduced bugs  
✅ Safe refactoring and maintainability  
✅ Alignment between **developer tests** and **user expectations**  

---

## 📑 ADR-008: Testing Methodology (TDD + BDD)  

### Context  

Our project follows **DDD** and **Hexagonal Architecture**, with services structured around **Domain**, **Application**, **Infrastructure**, and **API** layers. To ensure high-quality, maintainable code, we need a testing strategy that balances **developer confidence** and **user acceptance criteria**.  

---

### Decision  

We will adopt **Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD/E2E)** as complementary methodologies:  

| **Layer**             | **Methodology**            | **Scope**                          | **Test Type** | **Coverage Goal** | **Tools**                 |
|-----------------------|----------------------------|------------------------------------|---------------|--------------------|---------------------------|
| **Domain Layer**      | TDD                        | Entities, Value Objects, Domain Services | Unit          | 💯                  | Jest, Mocha/Chai          |
| **Application Layer** | TDD                        | UseCases, Orchestration            | Unit          | ≥ 90%              | Jest, Mocha/Chai          |
| **Infrastructure Layer** | Integration Tests (optional TDD) | Adapters, DB, Redis        | Integration   | ≥ 80%              | Jest + Testcontainers     |
| **API Layer**         | BDD/E2E                    | API Endpoints, Workflows           | E2E           | ≥ 70%              | Supertest, Cypress        |

---

### Guidelines  

✅ **TDD (Test-Driven Development)**  
- Write a **failing test first**, then implement the minimum code to pass, then refactor.  
- Focus on **Domain** and **Application** layers where logic is isolated and easily testable.  

✅ **BDD/E2E (Behavior-Driven Development)**  
- Write tests describing **expected user behavior** (e.g., API endpoints).  
- Validate end-to-end workflows from API to infrastructure.  

✅ **Integration Tests**  
- Use **real dependencies** (e.g., Postgres, Redis) via **Testcontainers/Docker Compose**.  
- Validate **Infrastructure Adapters** and their interactions with Application logic.  

## 🚀 Benefits

✅ Clean, testable code aligned with business needs  
✅ Early feedback and reduced bugs  
✅ Safe refactoring with coverage thresholds  
✅ Strong alignment between **developer tests** and **user expectations**  

---

## 📌 Summary

| **Aspect**      | **Guideline**                                        |
|-----------------|------------------------------------------------------|
| **TDD**         | Write failing tests first; focus on Domain & Application layers |
| **BDD/E2E**     | Define user-facing scenarios for API endpoints       |
| **Test Types**  | Unit, Integration, E2E                               |
| **Coverage**    | Enforce thresholds per layer                         |
| **Tools**       | Jest, Supertest, Cypress, Testcontainers             |
