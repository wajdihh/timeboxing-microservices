import { BaseDomainError, DomainHttpCode } from '@timeboxing/shared';

export class InvalidAccessTokenError extends BaseDomainError {
    static override readonly statusCode = DomainHttpCode.UNAUTHORIZED;
    static override readonly swaggerMessage = 'Unauthorized Access Token';
    constructor() {
        super(`'Unauthorized Access Token'`);
      }
}
