import { CollectMetricsUseCase } from '@identity/application/observability/CollectMetricsUseCase';
import { MetricsPort } from '@identity/application/observability/MetricsPort';

describe('CollectMetricsUseCase', () => {
  let useCase: CollectMetricsUseCase;
  let mockMetricsPort: jest.Mocked<MetricsPort>;

  beforeEach(() => {
    mockMetricsPort = {
      getMetrics: jest.fn(),
      startRequestTimer: jest.fn(),
      incrementRequestCounter: jest.fn(),
      incrementErrorCounter: jest.fn(),
      // Add missing methods to satisfy the MetricsPort interface
      incrementLogin: jest.fn(),
      incrementLogout: jest.fn(),
      incrementRegistration: jest.fn(),
      incrementRefreshToken: jest.fn(),
    } as jest.Mocked<MetricsPort>;

    useCase = new CollectMetricsUseCase(mockMetricsPort);
  });

  describe('getMetrics', () => {
    it('should call metricsPort.getMetrics and return its result', async () => {
      // Given
      const expectedMetrics = '# HELP some_metric_name some_metric_description\n# TYPE some_metric_name counter\nsome_metric_name 123\n';
      mockMetricsPort.getMetrics.mockResolvedValue(expectedMetrics);

      // When
      const result = await useCase.getMetrics();

      // Then
      expect(result).toBe(expectedMetrics);
      expect(mockMetricsPort.getMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('startRequestTimer', () => {
    it('should call metricsPort.startRequestTimer with correct params and return its result', () => {
      // Given
      const method = 'GET';
      const path = '/users';
      const status = '200'; // Add status for the call
      const mockEndTimerFn = jest.fn();
      mockMetricsPort.startRequestTimer.mockReturnValue(mockEndTimerFn);

      // When
      const endTimerFn = useCase.startRequestTimer(method, path, status);

      // Then
      expect(endTimerFn).toBe(mockEndTimerFn);
      expect(mockMetricsPort.startRequestTimer).toHaveBeenCalledWith(method, path, status);
      expect(mockMetricsPort.startRequestTimer).toHaveBeenCalledTimes(1);
    });
  });

  describe('incrementRequestCounter', () => {
    it('should call metricsPort.incrementRequestCounter with correct params', () => {
      // Given
      const method = 'POST';
      const path = '/auth/login';
      const status = '200';

      // When
      useCase.incrementRequestCounter(method, path, status);

      // Then
      expect(mockMetricsPort.incrementRequestCounter).toHaveBeenCalledWith(method, path, status);
      expect(mockMetricsPort.incrementRequestCounter).toHaveBeenCalledTimes(1);
    });
  });

  describe('incrementErrorCounter', () => {
    it('should call metricsPort.incrementErrorCounter with correct params', () => {
      // Given
      const method = 'GET';
      const path = '/unknown';
      const status = '404';

      // When
      useCase.incrementErrorCounter(method, path, status);

      // Then
      expect(mockMetricsPort.incrementErrorCounter).toHaveBeenCalledWith(method, path, status);
      expect(mockMetricsPort.incrementErrorCounter).toHaveBeenCalledTimes(1);
    });
  });
});
