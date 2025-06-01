import { BaseDomainError, DomainHttpCode } from '@timeboxing/shared';

export class InvalidSessionError extends BaseDomainError {
    static override readonly statusCode = DomainHttpCode.UNAUTHORIZED;
    static override readonly swaggerMessage = 'Invalid or expired Session';
    constructor() {
      super('Invalid or expired Session');
    }
  }