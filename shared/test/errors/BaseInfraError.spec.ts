import { BaseInfraError } from '../../src/errors/BaseInfraError'; // Renamed import
import { BaseError, ErrorType } from '../../src/errors/BaseError';

describe('BaseInfraError', () => { // Renamed describe
  const testMessage = 'Test infrastructure error message';
  const testContext = { component: 'Database', operation: 'connect' };
  const originalCause = new Error('Underlying network issue');

  it('should be an instance of BaseInfraError, BaseError, and Error', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err).toBeInstanceOf(BaseInfraError); // Renamed class
    expect(err).toBeInstanceOf(BaseError);
    expect(err).toBeInstanceOf(Error);
  });

  it('should have the correct name', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err.name).toBe('BaseInfraError'); // Renamed expected name
  });

  it('should have the correct errorType', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err.errorType).toBe(ErrorType.INFRASTRUCTURE);
  });

  it('should store the message correctly', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err.message).toBe(testMessage);
  });

  it('should store context correctly', () => {
    const err = new BaseInfraError(testMessage, testContext); // Renamed class
    expect(err.context).toEqual(testContext);
  });

  it('should store originalError correctly', () => {
    const err = new BaseInfraError(testMessage, undefined, originalCause); // Renamed class
    expect(err.originalError).toBe(originalCause);
  });

  it('should have undefined statusCode by default if not provided', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err.statusCode).toBeUndefined();
  });

  it('should allow setting statusCode with an instance value', () => {
    const instanceStatusCode = 503; // Service Unavailable
    const err = new BaseInfraError(testMessage, undefined, undefined, instanceStatusCode); // Renamed class
    expect(err.statusCode).toBe(instanceStatusCode);
  });

  it('should have a stack trace', () => {
    const err = new BaseInfraError(testMessage); // Renamed class
    expect(err.stack).toBeDefined();
    expect(typeof err.stack).toBe('string');
  });

  it('should correctly pass all parameters to BaseError constructor', () => {
    const instanceStatusCode = 500;
    const err = new BaseInfraError(testMessage, testContext, originalCause, instanceStatusCode); // Renamed class
    expect(err.message).toBe(testMessage);
    expect(err.context).toEqual(testContext);
    expect(err.originalError).toBe(originalCause);
    expect(err.statusCode).toBe(instanceStatusCode);
    expect(err.errorType).toBe(ErrorType.INFRASTRUCTURE);
  });
});
