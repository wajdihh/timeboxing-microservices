export enum ErrorType {
  DOMAIN = 'DomainError',
  INFRASTRUCTURE = 'InfraError',
  APPLICATION = 'ApplicationError', // For application-level errors that aren't strictly domain or infra
  UNKNOWN = 'UnknownError',
}

export interface ErrorDetails {
  message: string;
  context?: Record<string, unknown>;
  statusCode?: number; // HTTP status code
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalError?: any; // To store the original error if we're wrapping it
}

export abstract class BaseError extends Error {
  public readonly errorType: ErrorType;
  public readonly context?: Record<string, unknown>;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  constructor(details: ErrorDetails, type: ErrorType) {
    super(details.message);
    this.name = this.constructor.name; // More specific than just 'Error'
    this.errorType = type;
    this.context = details.context;
    this.statusCode = details.statusCode;
    this.originalError = details.originalError;

    // For stacktraces in V8 environments (Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
