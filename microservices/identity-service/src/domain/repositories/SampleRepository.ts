import { SampleEntity } from '@identity/domain/entities/SampleEntity';

export interface SampleRepository {
  getMessage(): Promise<SampleEntity>;
  setMessage(message: string): Promise<SampleEntity>;
}
