import { Sample } from '@identity/domain/entities/Sample';

export class SampleResponseDto {
  constructor(public readonly message: string) {}

  toDomain() {
    return new Sample(this.message);
  }
}
