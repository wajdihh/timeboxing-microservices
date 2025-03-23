import { AsyncLocalStorage } from "async_hooks";

export class RequestContextService {
    private static storage = new AsyncLocalStorage<Map<string, string>>();

    static setCorrelationId(id: string) {
        this.storage.run(new Map([['correlationId', id]]), () => {});
      }
    
      static getCorrelationId(): string {
        return this.storage.getStore()?.get('correlationId') || 'N/A';
      }
}