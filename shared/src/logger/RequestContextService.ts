import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class RequestContextService {
  private static als = new AsyncLocalStorage<Map<string, unknown>>();

  static get<T>(key: string): T | undefined {
    const store = RequestContextService.als.getStore();
    return store ? (store.get(key) as T) : undefined;
  }

  static set(key: string, value: unknown): void {
    const store = RequestContextService.als.getStore();
    if (store) {
      store.set(key, value);
    }
  }

  static run<R, TArgs extends unknown[]>(
    defaults: Map<string, unknown>,
    callback: (...args: TArgs) => R,
    ...args: TArgs
  ): R {
    return RequestContextService.als.run(defaults, callback, ...args);
  }

  // Helper for middleware/interceptors to easily start a context
  static startRequest<R>(callback: () => R): R {
    return RequestContextService.als.run(new Map<string, unknown>(), callback);
  }

  static getCorrelationId(): string | undefined {
    return this.get<string>('correlationId');
  }

  static setCorrelationId(id: string): void {
    this.set('correlationId', id);
  }
}
