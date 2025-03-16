export interface MetricsRepository {
  getMetrics(): Promise<string>;
  startRequestTimer(method: string, path: string): () => void;
  incrementRequestCounter(method: string, path: string, status: string): void;
  incrementErrorCounter(method: string, path: string, status: string): void;
}
export const METRICS_REPOSITORY_TOKEN = Symbol('MetricsRepository');
