export class SampleEntity {
  constructor(public readonly message: string) {}

  static create(message: string): SampleEntity {
    return new SampleEntity(message);
  }
}
