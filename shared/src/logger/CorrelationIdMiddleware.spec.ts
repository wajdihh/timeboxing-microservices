import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CorrelationIdMiddleware, CORRELATION_ID_HEADER } from './CorrelationIdMiddleware';
import { RequestContextService } from './RequestContextService';

// Mock dependencies
jest.mock('uuid', () => ({
  v4: jest.fn(),
}));
jest.mock('./RequestContextService');

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockNextFunction = jest.fn();
    
    // Reset mocks before each test
    (uuidv4 as jest.Mock).mockClear();
    (RequestContextService.startRequest as jest.Mock).mockClear();
    (RequestContextService.setCorrelationId as jest.Mock).mockClear();

    // Mock RequestContextService.startRequest to immediately call its callback
    (RequestContextService.startRequest as jest.Mock).mockImplementation((callback: () => void) => {
      callback();
    });
  });

  it('should generate a new correlation ID if not present in headers', () => {
    const generatedId = 'new-generated-id';
    (uuidv4 as jest.Mock).mockReturnValue(generatedId);

    middleware.use(mockRequest as Request, mockResponse as Response, mockNextFunction);

    expect(uuidv4).toHaveBeenCalledTimes(1);
    expect(RequestContextService.setCorrelationId).toHaveBeenCalledWith(generatedId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, generatedId);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });

  it('should use existing correlation ID from headers if present', () => {
    const existingId = 'existing-id-from-header';
    mockRequest.headers = { [CORRELATION_ID_HEADER]: existingId };

    middleware.use(mockRequest as Request, mockResponse as Response, mockNextFunction);

    expect(uuidv4).not.toHaveBeenCalled();
    expect(RequestContextService.setCorrelationId).toHaveBeenCalledWith(existingId);
    expect(mockResponse.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, existingId);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });
  
  it('should call RequestContextService.startRequest to wrap the logic', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, mockNextFunction);
    expect(RequestContextService.startRequest).toHaveBeenCalledTimes(1);
    // Ensure next() is called within the scope of startRequest's callback
    expect(RequestContextService.startRequest).toHaveBeenCalledWith(expect.any(Function));
  });
});
