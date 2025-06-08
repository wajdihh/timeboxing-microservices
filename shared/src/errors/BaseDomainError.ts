import { BaseError, ErrorDetails, ErrorType } from './BaseError';

/**
 * Use for domain business errors.
 * Extends BaseError to provide a standardized structure for domain-specific errors.
 * This is a concrete class and can be instantiated directly for general domain errors.
 */
export class BaseDomainError extends BaseError { 
  static statusCode = 400; // Default to Bad Request, made concrete. Removed 'override'
  static swaggerMessage: string = 'A domain-specific business rule was violated.'; // Default for Swagger docs. Removed 'override'

  constructor(
    message: string,
    context?: Record<string, unknown>,
    originalError?: unknown,
    statusCode?: number, 
  ) {
    const finalStatusCode = statusCode ?? BaseDomainError.statusCode; 
    const details: ErrorDetails = {
      message,
      context,
      statusCode: finalStatusCode,
      originalError,
    };
    super(details, ErrorType.DOMAIN);
  }
}
