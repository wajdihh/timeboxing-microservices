import { SampleEntity } from '@identity/domain/sample/SampleEntity';

export interface SampleRepository {
  getMessage(): Promise<SampleEntity>;
  setMessage(message: string): Promise<SampleEntity>;
}
