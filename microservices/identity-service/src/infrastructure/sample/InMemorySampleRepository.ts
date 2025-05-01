import { Injectable } from '@nestjs/common';
import { SampleEntity } from '@identity/domain/sample/SampleEntity';
import { SampleRepository } from '@identity/domain/sample/SampleRepository';

@Injectable()
export class InMemorySampleRepository implements SampleRepository {
  getMessage(): Promise<SampleEntity> {
    console.log('Infra InMemoryHelloRepository: getMessage');
    return Promise.resolve(SampleEntity.create('Hello from Database'));
  }

  async setMessage(message: string): Promise<SampleEntity> {
    console.log('Infra InMemoryHelloRepository: setMessage');
    return Promise.resolve(SampleEntity.create(message));
  }
}
