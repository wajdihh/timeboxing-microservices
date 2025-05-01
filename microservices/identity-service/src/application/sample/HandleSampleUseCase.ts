import { Injectable } from '@nestjs/common';
import { SamplePort } from '@identity/application/sample/SamplePort';
import { SampleRequestDto } from '@identity/application/sample/dto/SampleRequestDto';
import { SampleResponseDto } from '@identity/application/sample/dto/SampleResponseDto';
import { SampleRepository } from '@identity/domain/sample/SampleRepository';
@Injectable()
export class HandleSampleUseCase {
  constructor(
    private readonly sampleRepository: SampleRepository,
    private readonly samplePort: SamplePort,
  ) {}

  async getMessageFromDatabase(): Promise<SampleResponseDto> {
    const entity = await this.sampleRepository.getMessage();
    return new SampleResponseDto(entity.message);
  }

  async setMessageInDatabase(createDto: SampleRequestDto): Promise<SampleResponseDto> {
    const entity = await this.sampleRepository.setMessage(createDto.toDomain());
    return new SampleResponseDto(entity.message);
  }

  async getMessageFromExternalService(): Promise<string> {
    return this.samplePort.getMessage();
  }
}
