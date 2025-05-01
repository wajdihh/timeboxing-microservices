import { BaseDomainError, DomainHttpCode } from "@timeboxing/shared";

export class UserAlreadyExistsError extends BaseDomainError {

    static override readonly statusCode = DomainHttpCode.CONFLICT;
    static override readonly swaggerMessage = 'User already exists';

    constructor(email: string) {
        super(`User with email "${email}" already exists`);
      }
  }
  