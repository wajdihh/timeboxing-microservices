import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import { LoggerService, LogContext } from './LoggerService';
import { RequestContextService } from './RequestContextService';

// Mock winston
jest.mock('winston', () => {
  // Mock the transports
  const mockConsoleTransport = jest.fn();
  // Mock the format functions
  const mockFormatCombine = jest.fn().mockReturnThis(); // Return `this` to allow chaining
  const mockFormatTimestamp = jest.fn().mockReturnThis();
  const mockFormatJson = jest.fn().mockReturnThis();
  const mockFormatColorize = jest.fn().mockReturnThis();
  const mockFormatPrintf = jest.fn().mockImplementation(callback => {
    // Simulate the callback for printf to allow testing its behavior if needed
    // For basic tests, this might not be strictly necessary to call.
    return jest.fn(info => callback(info)); // Return a mock function that can be called with info
  });

  // Mock the logger instance methods
  const mockLoggerInstance = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    transports: [{ format: undefined }], // Mock transports array with a dummy transport
  };

  return {
    createLogger: jest.fn().mockReturnValue(mockLoggerInstance),
    format: {
      combine: mockFormatCombine,
      timestamp: mockFormatTimestamp,
      json: mockFormatJson,
      colorize: mockFormatColorize,
      printf: mockFormatPrintf,
    },
    transports: {
      Console: mockConsoleTransport,
    },
    // Keep other exports if LoggerService uses them, e.g. Logform
    Logform: {
        TransformableInfo : jest.fn() // Mock if TransformableInfo is used for type casting
    }
  };
});

// Mock RequestContextService
jest.mock('./RequestContextService');

describe('LoggerService', () => {
  let loggerService: LoggerService;
  let mockConfigService: Partial<ConfigService>;
  const mockWinstonLogger = winston.createLogger(); // This will get the mocked instance

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'SERVICE_NAME') return 'test-service';
        if (key === 'LOG_LEVEL') return 'debug';
        return undefined;
      }),
    };

    // Mock RequestContextService.getCorrelationId for controlled testing
    (RequestContextService.getCorrelationId as jest.Mock).mockReturnValue('test-correlation-id');
    
    loggerService = new LoggerService(mockConfigService as ConfigService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
  });

  it('constructor should initialize winston logger with values from ConfigService', () => {
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'debug', // From mockConfigService
      }),
    );
    // Check if serviceName is set correctly
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((loggerService as any).serviceName).toBe('test-service');
  });
  
  it('constructor should default serviceName and logLevel if not in ConfigService', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (mockConfigService.get as jest.Mock).mockImplementation((_key: string) => undefined); // Simulate ConfigService returning undefined
    const newLoggerService = new LoggerService(mockConfigService as ConfigService);
    expect(winston.createLogger).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info', // Default
      }),
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((newLoggerService as any).serviceName).toBe('unknown-service'); // Default
  });

  describe('log methods', () => {
    const testMessage = 'Test log message';
    const testContext: LogContext = { useCase: 'TestUseCase', customField: 'customValue' };

    it('log() should call winston.info with formatted message', () => {
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

    it('error() should call winston.error with formatted message and stacktrace', () => {
      const stack = 'Error stack trace';
      loggerService.error(testMessage, stack, testContext);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          stacktrace: stack,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
        }),
      );
    });
    
    it('warn() should call winston.warn with formatted message', () => {
      loggerService.warn(testMessage, testContext);
      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
        }),
      );
    });

    it('debug() should call winston.debug with formatted message', () => {
      loggerService.debug(testMessage, testContext);
      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
        }),
      );
    });
    
    it('verbose() should call winston.verbose with formatted message', () => {
      loggerService.verbose(testMessage, testContext);
      expect(mockWinstonLogger.verbose).toHaveBeenCalledWith(
        expect.objectContaining({
          message: testMessage,
          service: 'test-service',
          correlationId: 'test-correlation-id',
          useCase: 'TestUseCase',
        }),
      );
    });

    it('should handle string context correctly', () => {
        const stringContext = "StringContextClass";
        loggerService.log(testMessage, stringContext);
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
            expect.objectContaining({
                message: testMessage,
                service: 'test-service',
                correlationId: 'test-correlation-id',
                contextHint: stringContext,
            })
        );
    });

    it('should handle object message correctly', () => {
        const objectMessage = { customMsgField: "Custom Message Data", another: 123 };
        loggerService.log(objectMessage, testContext);
        expect(mockWinstonLogger.info).toHaveBeenCalledWith(
            expect.objectContaining({
                service: 'test-service',
                correlationId: 'test-correlation-id',
                useCase: 'TestUseCase',
                customField: 'customValue',
                customMsgField: "Custom Message Data", // from objectMessage
                another: 123, // from objectMessage
            })
        );
    });
  });
  
  // Test for production environment log format change
  it('should reconfigure console transport format for production environment', () => {
    process.env.NODE_ENV = 'production';
    new LoggerService(mockConfigService as ConfigService); // Re-instantiate to trigger constructor logic
    
    // Check that the format.combine was called again for the console transport
    // This is a bit tricky to assert directly on the transport's format object after modification.
    // We can check if format.json() was part of the calls to format.combine()
    // when re-assigning the transport format.
    // The mockWinstonLogger.transports[0].format should be the result of the second combine call.
    
    // This assertion depends on the mock structure.
    // We expect format.json to be called when setting up the production format.
    expect(winston.format.json).toHaveBeenCalled(); 
    // More robustly, one might spy on the transport's format property assignment if possible,
    // or check the number of times format.combine was called if the mock was set up to count specific sequences.
    
    delete process.env.NODE_ENV; // Clean up env var
  });

});
