import { BaseDomainError } from '../../src/errors/BaseDomainError';
import { BaseError, ErrorType } from '../../src/errors/BaseError';

describe('BaseDomainError', () => {
  const testMessage = 'Test domain error message';
  const testContext = { rule: 'BusinessRule123', attempt: 1 };
  const originalCause = new Error('Underlying validation issue');

  it('should be an instance of BaseDomainError, BaseError, and Error', () => {
    const err = new BaseDomainError(testMessage);
    expect(err).toBeInstanceOf(BaseDomainError);
    expect(err).toBeInstanceOf(BaseError);
    expect(err).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const err = new BaseDomainError(testMessage);
    expect(err.name).toBe('BaseDomainError');
  });

  it('should have the correct errorType', () => {
    const err = new BaseDomainError(testMessage);
    expect(err.errorType).toBe(ErrorType.DOMAIN);
  });

  it('should store the message correctly', () => {
    const err = new BaseDomainError(testMessage);
    expect(err.message).toBe(testMessage);
  });

  it('should store context correctly', () => {
    const err = new BaseDomainError(testMessage, testContext);
    expect(err.context).toEqual(testContext);
  });

  it('should store originalError correctly', () => {
    const err = new BaseDomainError(testMessage, undefined, originalCause);
    expect(err.originalError).toBe(originalCause);
  });

  it('should have statusCode 400 by default if not provided in constructor', () => {
    const err = new BaseDomainError(testMessage);
    expect(err.statusCode).toBe(400); // Default from BaseDomainError.statusCode
  });

  it('should allow overriding statusCode with a constructor argument', () => {
    const instanceStatusCode = 409; // Conflict
    const err = new BaseDomainError(testMessage, undefined, undefined, instanceStatusCode);
    expect(err.statusCode).toBe(instanceStatusCode);
  });
  
  it('should use the class static statusCode if constructor argument is undefined', () => {
    const err = new BaseDomainError(testMessage, undefined, undefined, undefined);
    expect(err.statusCode).toBe(BaseDomainError.statusCode); 
    expect(err.statusCode).toBe(400);
  });

  it('should have a stack trace', () => {
    const err = new BaseDomainError(testMessage);
    expect(err.stack).toBeDefined();
    expect(typeof err.stack).toBe('string');
  });

  it('should correctly pass all parameters to BaseError constructor', () => {
    const instanceStatusCode = 422; // Unprocessable Entity
    const err = new BaseDomainError(testMessage, testContext, originalCause, instanceStatusCode);
    expect(err.message).toBe(testMessage);
    expect(err.context).toEqual(testContext);
    expect(err.originalError).toBe(originalCause);
    expect(err.statusCode).toBe(instanceStatusCode);
    expect(err.errorType).toBe(ErrorType.DOMAIN);
  });

  it('should have correct static properties', () => {
    expect(BaseDomainError.statusCode).toBe(400);
    expect(BaseDomainError.swaggerMessage).toBe('A domain-specific business rule was violated.');
  });
});
