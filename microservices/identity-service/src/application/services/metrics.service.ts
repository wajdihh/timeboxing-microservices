import { Injectable } from '@nestjs/common';
import { MetricsRepository } from '../../domain/repositories/metrics.repository';

@Injectable()
export class MetricsService {
  constructor(private readonly metricsRepository: MetricsRepository) {}

  async getMetrics(): Promise<string> {
    return this.metricsRepository.getMetrics();
  }

  startRequestTimer(method: string, path: string): () => void {
    return this.metricsRepository.startRequestTimer(method, path);
  }

  incrementRequestCounter(method: string, path: string, status: string): void {
    this.metricsRepository.incrementRequestCounter(method, path, status);
  }

  incrementErrorCounter(method: string, path: string, status: string): void {
    this.metricsRepository.incrementErrorCounter(method, path, status);
  }
}
