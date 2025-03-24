import { Injectable } from '@nestjs/common';
import { SamplePort } from '../ports/SamplePort';
import { SampleRequestDto } from '../dto/requests/SampleRequestDto';
import { SampleResponseDto } from '../dto/responses/SampleResponseDto';
import { SampleRepository } from '../../domain/repositories/SampleRepository';
@Injectable()
export class SampleService {
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
