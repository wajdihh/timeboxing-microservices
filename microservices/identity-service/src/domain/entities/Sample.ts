export class Sample {
  constructor(public readonly message: string) {}

  static create(message: string): Sample {
    return new Sample(message);
  }
}
