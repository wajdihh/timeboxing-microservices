import { applyDecorators, ExecutionContext, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '../StrategyType';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { ApiBearerAuth } from '@nestjs/swagger';
import { InvalidAccessTokenError } from '@identity/domain/auth/errors/InvalidAccessTokenError';


export function ProtectByAuthGuard(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('access-token'),
  );
}

@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyType.JWT) {
  override handleRequest<TUser = UserEntity>(
    err: Error | null,
    user: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: unknown
    
  ): TUser {


    if (err || !user || !(user instanceof UserEntity)) {
      throw new InvalidAccessTokenError();
    }

    return user as TUser;
  }
  
}