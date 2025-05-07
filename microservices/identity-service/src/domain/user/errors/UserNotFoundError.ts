import { BaseDomainError, DomainHttpCode } from "@timeboxing/shared";

export class UserNotFoundError extends BaseDomainError {

    static override readonly statusCode = DomainHttpCode.NOT_FOUND;
    static override readonly swaggerMessage = 'User not found.';
    constructor(id: string) {
        super(`The user with ID "${id}" was not found.`);
    }
}