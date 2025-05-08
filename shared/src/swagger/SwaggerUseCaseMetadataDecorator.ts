import 'reflect-metadata';
import { DomainHttpCode } from '../errors/DomainHttpStatusCodeUtil';

export type HttpSuccessCode = (typeof DomainHttpCode)[keyof typeof DomainHttpCode];
export enum AuthTokenType { AccessToken, RefreshToken}
export enum SuccessStatus { CREATED, OK, NO_CONTENT}
type Constructor<T = unknown> = new (...args: unknown[]) => T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ErrorConstructor = new (...args: any[]) => Error;

interface UseCaseMetadataOptions {
  request?: Constructor;
  response?: Constructor;
  errors?: ErrorConstructor[];
  successStatus?: SuccessStatus;
  authTokenType?: AuthTokenType;
}

export function SwaggerUseCaseMetadata(options: UseCaseMetadataOptions): ClassDecorator {
  return (target: object) => {
    if (options.request) {
      Reflect.defineMetadata('usecase:request', options.request, target);
    }
    if (options.response) {
      Reflect.defineMetadata('usecase:response', options.response, target);
    }
    if (options.errors) {
      Reflect.defineMetadata('usecase:errors', options.errors, target);
    }
    if (options.successStatus) {
      Reflect.defineMetadata('usecase:successStatus', options.successStatus, target);
    }
    if (options.authTokenType) {
      Reflect.defineMetadata('usecase:authTokenType', options.authTokenType, target);
    }
  };
}