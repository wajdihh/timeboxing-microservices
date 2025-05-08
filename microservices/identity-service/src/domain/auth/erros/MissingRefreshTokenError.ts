import { BaseDomainError, DomainHttpCode } from '@timeboxing/shared';

export class MissingRefreshTokenError extends BaseDomainError {
    static override readonly statusCode = DomainHttpCode.UNAUTHORIZED;
    static override readonly swaggerMessage = 'Missing or invalid refresh token in Authorization header';
  constructor() {
    super('Missing or invalid refresh token in Authorization header');
  }
}
