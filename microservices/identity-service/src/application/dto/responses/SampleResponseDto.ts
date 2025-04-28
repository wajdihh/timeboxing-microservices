import { SampleEntity } from '@identity/domain/entities/SampleEntity';

export class SampleResponseDto {
  constructor(public readonly message: string) {}

  toDomain() {
    return new SampleEntity(this.message);
  }
}
