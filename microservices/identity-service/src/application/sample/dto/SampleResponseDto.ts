import { SampleEntity } from '@identity/domain/sample/SampleEntity';

export class SampleResponseDto {
  constructor(public readonly message: string) {}

  toDomain() {
    return new SampleEntity(this.message);
  }
}
