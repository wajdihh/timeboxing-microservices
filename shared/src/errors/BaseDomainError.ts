/**
 * Use for domain business errors
 */
export abstract class BaseDomainError extends Error {
  static statusCode?: number;
  static swaggerMessage: string = 'Default message by BaseDomainError';

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
