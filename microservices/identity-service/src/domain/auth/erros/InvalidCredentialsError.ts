// domain/errors/InvalidCredentialsError.ts
import { BaseDomainError, DomainHttpCode } from '@timeboxing/shared';

export class InvalidCredentialsError extends BaseDomainError {
    static override readonly statusCode = DomainHttpCode.UNAUTHORIZED;
    static override readonly swaggerMessage = 'Invalid email or password';
    constructor() {
        super(`'Invalid email or password'`);
      }
}
