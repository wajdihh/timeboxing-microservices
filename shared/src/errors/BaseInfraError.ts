import { BaseError, ErrorDetails, ErrorType } from './BaseError';

/**
 * Represents a base infrastructure error (e.g., database connection, external API failure, timeout).
 * This is a concrete class that can be instantiated for general infrastructure-related issues
 * or extended by more specific infrastructure errors.
 */
export class BaseInfraError extends BaseError { // Renamed from InfraError
   static defaultStatusCode = 503; // Service Unavailable is often a good default for infra issues

  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: unknown,
    statusCode?: number, 
  ) {
    const details: ErrorDetails = {
      message,
      context,
      statusCode: statusCode, 
      originalError,
    };
    super(details, ErrorType.INFRASTRUCTURE);
  }
}
