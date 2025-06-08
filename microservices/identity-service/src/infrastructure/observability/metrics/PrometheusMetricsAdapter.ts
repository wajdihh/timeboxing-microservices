import { Injectable, Logger } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { MetricsPort } from '@identity/application/observability/MetricsPort';

@Injectable()
export class PrometheusMetricsAdapter implements MetricsPort {
  private readonly logger = new Logger(PrometheusMetricsAdapter.name);
  public readonly register: Registry;
  private readonly requestCounter: Counter<string>;
  private readonly errorCounter: Counter<string>;
  private readonly requestDuration: Histogram<string>;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.errorCounter = new Counter({
      name: 'http_errors_total',
      help: 'Total number of HTTP errors',
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    try {
      return await this.register.metrics();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to collect metrics', errorMessage);
      throw new Error('Failed to collect metrics');
    }
  }

  incrementRequestCounter(method: string, route: string, status: string) {
    this.requestCounter.labels(method, route, status).inc();
  }

  incrementErrorCounter(method: string, route: string, status: string) {
    this.errorCounter.labels(method, route, status).inc();
  }

  startRequestTimer(method: string, route: string) {
    return this.requestDuration.labels(method, route).startTimer();
  }
}
