import { ID } from "@timeboxing/shared";

describe('ID Value Object', () => {

  it('should create an ID from a valid UUID string', () => {
    const result = ID.from('f1e10f59-f63d-4d52-b8fc-ef5347b70021');
    expect(result.isOk).toBe(true);
    expect(result.unwrap().value).toBe('f1e10f59-f63d-4d52-b8fc-ef5347b70021');
  });

  it('should fail if input is not a valid UUID', () => {
    const result = ID.from('invalid-string');
    expect(result.isFail).toBe(true);
    expect(result.error).toBeInstanceOf(TypeError);
  });

  it('should return the same ID if given an ID instance', () => {
    const original = ID.generate();
    const result = ID.from(original);
    expect(result.isOk).toBe(true);
    expect(result.unwrap()).toBe(original);
  });

  it('should accept a JSON-shaped ID object', () => {
    const uuid = 'be830002-eb0f-44bc-af04-12f6efd2e926';
    const result = ID.from({ _value: uuid });
    expect(result.isOk).toBe(true);
    expect(result.unwrap().value).toBe(uuid);
  });

  it('should fail for null input', () => {
    const result = ID.from(null as unknown as string);
    expect(result.isFail).toBe(true);
  });

  it('should fail for numeric input', () => {
    const result = ID.from(12345 as unknown as string);
    expect(result.isFail).toBe(true);
  });

  it('should correctly compare two equal IDs', () => {
    const id1 = ID.from('e8f6ec59-184e-4b1b-91b6-c6a6899bc0e5').unwrap();
    const id2 = ID.from('e8f6ec59-184e-4b1b-91b6-c6a6899bc0e5').unwrap();
    expect(id1.equals(id2)).toBe(true);
  });

  it('should correctly compare two different IDs', () => {
    const id1 = ID.generate();
    const id2 = ID.generate();
    expect(id1.equals(id2)).toBe(false);
  });

});