export class ID {

  private constructor(private readonly _value: string) { }

  static from(value: string | ID | { _value: string }): ID {
    if (value instanceof ID) {
      return value;
    }
  
    if (typeof value === 'object' && value !== null && '_value' in value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (value as any)._value;
      if (typeof raw === 'string') {
        return new ID(raw);
      }
      console.warn('[ID] received a JSON-shaped ID — fallback used');
    }
  
    if (typeof value !== 'string') {
      throw new TypeError(`ID must be created from a string. Received: ${typeof value}`);
    }
  
    if (!UUID_REGEX.test(value)) {
      throw new Error(`Invalid UUID format: ${value}`);
    }
  
    return new ID(value);
  }
  
  static generate(): ID {
    return new ID(crypto.randomUUID());
  }

  get value(): string {
    return this._value;
  }

  equals(other: ID): boolean {
    return this._value === other._value;
  }

  /**
   * For test-only usage.
   */
  static fake(value: string = 'test-id'): ID {
    return new ID(value);
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
