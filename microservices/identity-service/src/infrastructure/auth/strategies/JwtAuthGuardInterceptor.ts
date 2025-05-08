import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '../strategies/StrategyType';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { InvalidAccessTokenError } from '@identity/domain/auth/erros/InvalidAccessTokenError';

@Injectable()
export class JwtAuthGuard extends AuthGuard(StrategyType.JWT) {
    override handleRequest: typeof AuthGuard.prototype.handleRequest = (
        err: Error,
        user: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _info: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _status?: unknown,
      ): UserEntity => {
        if (err || !user || !(user instanceof UserEntity)) {
          throw new InvalidAccessTokenError();
        }
      
        return user;
      };
}
