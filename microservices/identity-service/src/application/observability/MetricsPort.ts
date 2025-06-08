export interface MetricsPort {
  getMetrics(): Promise<string>;
  startRequestTimer(method: string, path: string, status: string): () => void;
  incrementRequestCounter(method: string, path: string, status: string): void;
  incrementErrorCounter(method: string, path: string, status: string): void;

  // Business Metrics
  incrementLogin(method: string): void;
  incrementLogout(method: string): void;
  incrementRegistration(method: string): void;
  incrementRefreshToken(method: string): void;
}