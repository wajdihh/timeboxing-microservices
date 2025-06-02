import { BaseDomainError } from "./BaseDomainError";
import { DomainHttpCode } from "./DomainHttpStatusCodeUtil";

export class InvalidIDError extends BaseDomainError {

    static override readonly statusCode = DomainHttpCode.UNPROCESSABLE_ENTITY;
    static override readonly swaggerMessage = 'Invalid ID format.';
    constructor(id: string) {
        super(`The ID "${id}" is invalid.`);
      }
}