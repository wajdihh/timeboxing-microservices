import { Injectable } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService {
  public readonly register: Registry;

  constructor() {
    this.register = new Registry();
    collectDefaultMetrics({ register: this.register });
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }
}
