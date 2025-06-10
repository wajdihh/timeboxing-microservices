import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { LoggerService, LogContext } from '../../src/logger/LoggerService';
import { RequestContextService } from '../../src/logger/RequestContextService';
import { BaseDomainError, BaseInfraError, ErrorType } from '../../src/errors';

jest.mock('winston', () => {
  const mockConsoleTransport = jest.fn();
  const mockFileTransport = jest.fn();
  const mockFormatCombine = jest.fn().mockReturnThis();
  const mockFormatTimestamp = jest.fn().mockReturnThis();
  const mockFormatJson = jest.fn().mockReturnThis();
  const mockFormatColorize = jest.fn().mockReturnThis();

  const mockLoggerInstance = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    add: jest.fn(),
    transports: [{ format: undefined }],
  };

  return {
    createLogger: jest.fn().mockReturnValue(mockLoggerInstance),
    format: {
      combine: mockFormatCombine,
      timestamp: mockFormatTimestamp,
      printf: mockFormatJson,
      colorize: mockFormatColorize,
    },
    transports: {
      Console: mockConsoleTransport,
      File: mockFileTransport,
    },
  };
});

jest.mock('../../src/logger/RequestContextService');

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockConfigService: Partial<ConfigService>;
  const mockWinstonLogger = winston.createLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'SERVICE_NAME') return 'test-service';
        if (key === 'LOG_LEVEL') return 'debug';
        return undefined;
      }),
    };
    (RequestContextService.getCorrelationId as jest.Mock).mockReturnValue('test-correlation-id');
    loggerService = new LoggerService(mockConfigService as ConfigService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
  });

  it('should configure logger with defaults from ConfigService', () => {
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug',
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((loggerService as any).serviceName).toBe('test-service');
  });

  describe('log methods', () => {
    const testMessage = 'Test log message';
    const testContext: LogContext = { useCase: 'TestUseCase', customField: 'customValue' };

    it('log() should call info with structured log', () => {
      loggerService.log(testMessage, testContext);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
          customField: 'customValue',
        }),
      );
    });

    it('error() should handle plain string error', () => {
      const stack = 'Error stack trace';
      loggerService.error(testMessage, stack, testContext);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          stacktrace: stack,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
          customField: 'customValue',
        }),
      );
    });

    it('error() should handle BaseDomainError', () => {
      const domainError = new BaseDomainError('Domain violation', { reason: 'test reason' }, new Error('Original'), 400);
      loggerService.error(domainError, domainError.stack, testContext);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Domain violation',
          errorType: ErrorType.DOMAIN,
          name: 'BaseDomainError',
          useCase: 'TestUseCase',
          customField: 'customValue',
          stacktrace: domainError.stack,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          originalError: expect.objectContaining({
            message: 'Original',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            stack: expect.any(String),
          }),
        }),
      );
    });

    it('error() should handle BaseInfraError', () => {
      const infraError = new BaseInfraError('Infra failure', { detail: 'db down' }, undefined, 503);
      loggerService.error(infraError, infraError.stack, testContext);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Infra failure',
          errorType: ErrorType.INFRASTRUCTURE,
          name: 'BaseInfraError',
          useCase: 'TestUseCase',
          customField: 'customValue',
          stacktrace: infraError.stack,
          service: 'test-service',
          correlationId: 'test-correlation-id',
        }),
      );
    });

    it('error() should handle generic Error', () => {
      const genericError = new Error('Generic error');
      loggerService.error(genericError, genericError.stack, testContext);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Generic error',
          errorType: ErrorType.UNKNOWN,
          name: 'Error',
          useCase: 'TestUseCase',
          customField: 'customValue',
          stacktrace: genericError.stack,
          service: 'test-service',
          correlationId: 'test-correlation-id',
        }),
      );
    });

    it('should handle object messages', () => {
      const objectMessage = { key: 'value', another: 123 };
      loggerService.log(objectMessage, testContext);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
          customField: 'customValue',
          key: 'value',
          another: 123,
        }),
      );
    });

    it('should handle string context', () => {
      loggerService.log(testMessage, 'TestContext');
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestContext',
        }),
      );
    });
  });
});
