// shared/decorators/ApiErrorsFromUseCase.ts
import { applyDecorators, Type } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { BaseDomainError } from '../errors/BaseDomainError';
import { AuthTokenType, DomainHttpCode, SuccessStatus } from '../errors';

/**
 * 
 * Used to extract metadata from the use case class and apply the necessary decorators to the controller method for Swagger documentation.
 * @param request - The request DTO class. Exp : RegisterUserRequestDto
 * @param response - The response DTO class. Exp : UserResponseDto
 * @param errors - An array of error classes that the use case can throw. Exp : [InvalidEmailError, UserAlreadyExistsError] -> Domain Erros
 * @returns 
 */
export function SwaggerUseCase(useCaseClass: Type<unknown>) {
  const request = Reflect.getMetadata('usecase:request', useCaseClass);
  const response = Reflect.getMetadata('usecase:response', useCaseClass);
  const successStatus = Reflect.getMetadata('usecase:successStatus', useCaseClass) ?? SuccessStatus.OK;
  const errors: Array<typeof BaseDomainError> = Reflect.getMetadata('usecase:errors', useCaseClass) ?? [];
  const authTokenType = Reflect.getMetadata('usecase:authTokenType', useCaseClass);

  const decorators = [];

  // Add auth tokens
  if (authTokenType === AuthTokenType.AccessToken) {
    decorators.push(ApiBearerAuth('access-token'));
  } else if (authTokenType === AuthTokenType.RefreshToken) {
    decorators.push(ApiBearerAuth('refresh-token'));
  }

  // Request body with example
  if (request?.sample) {
    decorators.push(
      ApiBody({
        type: request,
        examples: {
          default: {
            summary: 'Sample request',
            value: request.sample(),
          },
        },
      })
    );
  }

  // Response with example (204 No Content or 200/201 OK)
  if (successStatus === SuccessStatus.NO_CONTENT) {
    decorators.push(
      ApiResponse({
        status: DomainHttpCode.NO_CONTENT,
        description: 'No content',
      })
    );
  } else if (response?.sample) {
    const successStatusCode = (successStatus === SuccessStatus.OK ? DomainHttpCode.OK : DomainHttpCode.CREATED);
    decorators.push(
      ApiResponse({
        status: successStatusCode,
        description: 'Success',
        schema: {
          example: response.sample(),
        },
      })
    );
  }

  // Error examples
  for (const ErrorClass of errors) {
    const statusCode = (ErrorClass as typeof BaseDomainError).statusCode ?? 400;
    const message = (ErrorClass as typeof BaseDomainError).swaggerMessage ?? ErrorClass.name;
    const name = ErrorClass.name;

    decorators.push(
      ApiResponse({
        status: statusCode,
        description: message,
        schema: {
          example: {
            statusCode,
            message,
            error: name,
          },
        },
      })
    );

    //Handled by the global exception filter based on DTO validation
    decorators.push(
      ApiResponse({
        status: 400,
        description: 'Invalid DTO validation Pipe',
        schema: {
          example: {
            statusCode: 400,
            message: ['examples: email must be a valid email', 'password must be at least 8 characters'],
            error: 'Bad Request',
          },
        },
      })
    );
  }

  return applyDecorators(...decorators);
}