import { BaseDomainError, DomainHttpCode } from '@timeboxing/shared';

export class InvalidRefreshTokenError extends BaseDomainError {
    static override readonly statusCode = DomainHttpCode.UNAUTHORIZED;
    static override readonly swaggerMessage = 'Invalid or expired refresh token';
    constructor() {
      super('Invalid or expired refresh token');
    }
  }