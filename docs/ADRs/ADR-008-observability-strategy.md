# ✅ ADR-006: Observability Strategy (Metrics, Logs, Tracing)

## 🎯 Decision

We define a foundational **Observability Strategy** for all microservices in the TimeBoxing monorepo. This includes plans for **metrics collection**, **structured logging**, **health checks**, and future-proofing for **tracing and alerting**.

This ADR provides a solid baseline for real-world readiness (even for local dev) and prepares the system for scaling with distributed tools (Prometheus, Grafana, OpenTelemetry, etc.).

---

## 📊 Metrics

### ✅ Implemented:

* **Prometheus-compatible metrics** exposed via `/metrics` endpoint
* Metrics collected via `MetricsPort` in `application/observability`
* Default counters:

  * `http_requests_total{method, path, status}`
  * `http_errors_total{method, path, status}`
  * `http_request_duration_seconds`

### 🔮 Future-Proof:

* Add **histograms** for latency and load analysis
* Instrument **custom business metrics** (e.g., tasks.created, stripe.charges.count)
* Expose `/metrics` for sidecar scraping by Prometheus

---

## 📚 Logs

### ✅ Strategy:

* Use `winston` logger wrapped in `LoggerService`
* Logs are structured (JSON), including:

  * `timestamp`, `level`, `message`, `service`, `useCase`, `correlationId`

### 🚨 Plan:

* Log levels: `info`, `warn`, `error`, `debug`
* Audit trails for sensitive events
* Route logs to console (dev) and to files or Loki (prod)
* Example log format:

```json
{
  "timestamp": "2025-05-02T12:34:56.123Z",
  "level": "info",
  "service": "identity-service",
  "useCase": "CreateTaskUseCase",
  "correlationId": "abc-123",
  "message": "Task created successfully"
}
```

---

## ♻️ Correlation ID Propagation

### ✅ Implemented:

* `CorrelationIdMiddleware` generates or propagates `x-correlation-id`
* Stored in `RequestContextService`

### 🔮 Future:

* Correlation ID passed across microservice calls (HTTP headers)
* Enable distributed tracing with OpenTelemetry-compatible headers

---

## 🔬 Health & Readiness

### ✅ Plan:

* Expose two endpoints:

  * `/health` → basic check (responds 200 OK)
  * `/ready` → full check (DB, external APIs)
* Ready for Kubernetes or Docker health checks

---

## 🔍 Error Categorization

### 🚨 Planned Categories:

* **DomainError** → business logic violations
* **InfraError** → database/API/timeouts
* Used for error tagging, log coloring, and alert classification

---

## 📡 Alerting Strategy (Placeholder)

### Not Implemented Yet — But Documented:

* `http_error_rate > 5% for 5m` → send Slack alert
* `average_latency > 1.5s for 10m` → send email alert
* Define `.yaml` alert rules when Prometheus is added

---

## 🧪 Synthetic Monitoring

### Future Idea:

* Run Postman collection or Playwright synthetic test for key flows:

  * Create Task
  * Login + Token Validation
* Hook into CI/CD to run after deployment

---

## 📍 Observability-Related Folder Convention

```plaintext
application/
└── observability/
    ├── MetricsPort.ts
    ├── CollectMetricsUseCase.ts

infrastructure/
└── adapters/
    └── observability/
        └── PrometheusMetricsAdapter.ts

shared/
└── logging/
    ├── LoggerService.ts
    ├── CorrelationIdMiddleware.ts
    └── RequestContextService.ts
```

---

## ✅ Summary

| Concern        | Strategy                       | Notes                                    |
| -------------- | ------------------------------ | ---------------------------------------- |
| Metrics        | Prometheus format              | Exposed via `/metrics`, extensible       |
| Logging        | JSON logs via Winston          | Includes correlationId, service, useCase |
| Correlation ID | Middleware + RequestContext    | Ready for OpenTelemetry integration      |
| Health Checks  | `/health` + `/ready` endpoints | Compatible with Docker/K8s               |
| Alerting       | Planned rules only             | Alerts defined in YAML in the future     |
| Tracing        | Future with OpenTelemetry      | Using correlation ID foundation          |
| Monitoring     | Synthetic scripts planned      | Optional with CI/CD integrations         |
