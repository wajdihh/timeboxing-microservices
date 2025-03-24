import { Sample } from '../entities/Sample';

export interface SampleRepository {
  getMessage(): Promise<Sample>;
  setMessage(message: string): Promise<Sample>;
}
