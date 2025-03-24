import { Injectable } from '@nestjs/common';
import { Sample } from '@identity/domain/entities/Sample';
import { SampleRepository } from '@identity/domain/repositories/SampleRepository';

@Injectable()
export class InMemorySampleRepository implements SampleRepository {
  getMessage(): Promise<Sample> {
    console.log('Infra InMemoryHelloRepository: getMessage');
    return Promise.resolve(Sample.create('Hello from Database'));
  }

  async setMessage(message: string): Promise<Sample> {
    console.log('Infra InMemoryHelloRepository: setMessage');
    return Promise.resolve(Sample.create(message));
  }
}
