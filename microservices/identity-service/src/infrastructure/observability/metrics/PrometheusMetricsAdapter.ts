import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
import { MetricsPort } from '@identity/application/observability/MetricsPort';
import { LoggerService } from '@timeboxing/shared';

@Injectable()
export class PrometheusMetricsAdapter implements MetricsPort {
  public readonly register: Registry;
  private readonly requestCounter: Counter<string>;
  private readonly errorCounter: Counter<string>;
  private readonly requestDuration: Histogram<string>;

  // Business metrics
  private readonly loginCounter: Counter<string>;
  private readonly logoutCounter: Counter<string>;
  private readonly registrationCounter: Counter<string>;
  private readonly refreshTokenCounter: Counter<string>;

  constructor(private readonly myLogger: LoggerService) {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });

    // Technical metrics
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
      labelNames: ['method', 'route', 'status'],
      registers: [this.register],
    });

    // Business metrics
    this.loginCounter = new Counter({
      name: 'identity_logins_total',
      help: 'Total number of successful user logins',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.logoutCounter = new Counter({
      name: 'identity_logouts_total',
      help: 'Total number of user logouts',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.registrationCounter = new Counter({
      name: 'identity_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['method'],
      registers: [this.register],
    });

    this.refreshTokenCounter = new Counter({
      name: 'identity_refresh_tokens_total',
      help: 'Total number of successful token refreshes',
      labelNames: ['method'],
      registers: [this.register],
    });
  }

  async getMetrics(): Promise<string> {
    try {
      return await this.register.metrics();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.stack : String(error);
      this.myLogger.error({
        message: 'Failed to collect metrics',
        useCase: 'collectMetrics',
        error: errorMessage,
      });
      throw new Error('Failed to collect metrics');
    }
  }

  incrementRequestCounter(method: string, route: string, status: string) {
    this.requestCounter.labels(method, route, status).inc();
  }

  incrementErrorCounter(method: string, route: string, status: string) {
    this.errorCounter.labels(method, route, status).inc();
  }

  startRequestTimer(method: string, route: string, status: string) {
    return this.requestDuration.labels(method, route, status).startTimer();
  }

  // Business metrics increment methods
  incrementLogin(method: string) {
    this.loginCounter.labels(method).inc();
  }

  incrementLogout(method: string) {
    this.logoutCounter.labels(method).inc();
  }

  incrementRegistration(method: string) {
    this.registrationCounter.labels(method).inc();
  }

  incrementRefreshToken(method: string) {
    this.refreshTokenCounter.labels(method).inc();
  }
}

export const PROMETHEUSE_METRICS_ADAPTER = Symbol('PrometheusMetricsAdapter');