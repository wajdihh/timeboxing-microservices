import { Sample } from '@identity/domain/entities/Sample';

export interface SampleRepository {
  getMessage(): Promise<Sample>;
  setMessage(message: string): Promise<Sample>;
}
