import { Injectable } from '@nestjs/common';
import { SamplePort } from '../../../application/ports/SamplePort';

@Injectable()
export class PrefixSampleAdapter implements SamplePort {
  getMessage(): Promise<string> {
    console.log('Infra InMemoryHelloRepository: getMessage');
    return Promise.resolve('Hello from External service like EMAIL, SMS, etc.');
  }
}
