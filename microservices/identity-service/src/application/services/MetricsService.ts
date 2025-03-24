import { Injectable } from '@nestjs/common';
import { MetricsPort } from '@identity/application/ports/MetricsPort';

@Injectable()
export class MetricsService {
  constructor(private readonly metricsPort: MetricsPort) {}

  async getMetrics(): Promise<string> {
    return this.metricsPort.getMetrics();
  }

  startRequestTimer(method: string, path: string): () => void {
    return this.metricsPort.startRequestTimer(method, path);
  }

  incrementRequestCounter(method: string, path: string, status: string): void {
    this.metricsPort.incrementRequestCounter(method, path, status);
  }

  incrementErrorCounter(method: string, path: string, status: string): void {
    this.metricsPort.incrementErrorCounter(method, path, status);
  }
}
