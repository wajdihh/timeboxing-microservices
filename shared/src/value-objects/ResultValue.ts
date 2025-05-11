export class ResultValue<T, E extends Error = Error> {
  private constructor(
    public readonly isOk: boolean,
    public readonly isFail: boolean,
    private readonly _value?: T,
    private readonly _error?: E
  ) {
    Object.freeze(this);
  }

  static ok(): ResultValue<void>;
  static ok<T>(value: T): ResultValue<T>;

  static ok<T>(value?: T): ResultValue<T | void> {
    return new ResultValue<T>(true, false, value);
  }

  static error<E extends Error>(error: E): ResultValue<never, E> {
    return new ResultValue<never, E>(false, true, undefined, error);
  }

  static isOk<T, E extends Error>(result: ResultValue<T, E>): result is ResultValue<T, E> {
    return result.isOk;
  }

  static isFail<T, E extends Error>(result: ResultValue<T, E>): result is ResultValue<never, E> {
    return result.isFail;
  }

  static returnValue<T, E extends Error>(result: ResultValue<T, E>): T {
    if (result.isFail) throw result._error;
    return result._value as T;
  }

  static returnError<T, E extends Error>(result: ResultValue<T, E>): E {
    if (result.isOk) throw new Error('Cannot extract error from a successful result');
    return result._error as E;
  }

  unwrap(): T {
    if (this.isFail) throw this._error;
    return this._value as T;
  }

  get error(): E {
    if (this.isOk) throw new Error('Cannot get error from a successful result');
    return this._error as E;
  }
}

