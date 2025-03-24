import { ApiProperty } from '@nestjs/swagger';

export class SampleRequestDto {
  @ApiProperty({ example: 'Hello World' })
  public readonly message: string;

  constructor(message: string) {
    this.message = message;
  }

  toDomain(): string {
    return this.message;
  }
}
