import { applyDecorators, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '../StrategyType';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BaseDomainError } from '@timeboxing/shared';


export function AddLocalGuard(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    UseGuards(CustomLocalAuthGuard),
    ApiBearerAuth('access-token'),
  );
}

@Injectable()
export class CustomLocalAuthGuard extends AuthGuard(StrategyType.LOCAL) { // Class is not generic
  // eslint-disable-next-line @typescript-eslint/no-unused-vars , @typescript-eslint/no-explicit-any
  handleRequest(err: unknown, user: UserEntity | false | null, info: { message: string } | string | null, _context: ExecutionContext, _status?: unknown): any { 
    if (err instanceof BaseDomainError) {
      const ctor = err.constructor as typeof BaseDomainError;
      const statusCode = ctor.statusCode ?? HttpStatus.BAD_REQUEST;
      throw new HttpException(
        {
          statusCode: statusCode,
          message: err.message,
          error: err.name,
        },
        statusCode,
      );
    }

    if (err) {
      // If err is not a BaseDomainError but some other error, re-throw it.
      throw err;
    }
    
    if (!user) {
      const message = typeof info === 'object' && info !== null && 'message' in info ? info.message : info as string || 'Unauthorized';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}