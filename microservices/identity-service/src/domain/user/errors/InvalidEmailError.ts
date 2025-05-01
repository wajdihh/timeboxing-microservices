import { BaseDomainError, DomainHttpCode } from "@timeboxing/shared";

export class InvalidEmailError extends BaseDomainError {

    static override readonly statusCode = DomainHttpCode.UNPROCESSABLE_ENTITY;
    static override readonly swaggerMessage = 'Invalid email format.';
    constructor(email: string) {
        super(`The email "${email}" is invalid.`);
      }
}