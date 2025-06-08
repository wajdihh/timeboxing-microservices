import { Injectable } from '@nestjs/common';
import { MetricsPort } from '@identity/application/observability/MetricsPort';

@Injectable()
export class CollectMetricsUseCase {
  constructor(private readonly metricsPort: MetricsPort) {}

  async getMetrics(): Promise<string> {
    return this.metricsPort.getMetrics();
  }

  startRequestTimer(method: string, path: string, status: string): () => void {
    return this.metricsPort.startRequestTimer(method, path, status);
  }


  incrementRequestCounter(method: string, path: string, status: string): void {
    this.metricsPort.incrementRequestCounter(method, path, status);
  }

  incrementErrorCounter(method: string, path: string, status: string): void {
    this.metricsPort.incrementErrorCounter(method, path, status);
  }
}
