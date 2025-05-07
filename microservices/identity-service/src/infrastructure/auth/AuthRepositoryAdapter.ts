import { AuthRepository } from '@identity/domain/auth/AuthRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { ID, ResultValue } from '@timeboxing/shared';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { InvalidRefreshTokenError } from '@identity/domain/auth/erros/InvalidRefreshTokenError';

@Injectable()
export class AuthRepositoryAdapter implements AuthRepository {
  
  constructor(private readonly config: ConfigService) {}
  async generateAccessToken(user: UserEntity): Promise<ResultValue<string>> {
    const secret = this.config.get<string>('jwt.secret');
    if (!secret) throw new Error('JWT_SECRET not configured');

    const options: jwt.SignOptions = {
      expiresIn: this.config.get('jwt.expiresIn') || '15m',
    };
    const token = jwt.sign({ sub: user.id, email: user.email }, secret as jwt.Secret, options);
    return ResultValue.ok(token);
  }

  async generateRefreshToken(user: UserEntity): Promise<ResultValue<string>> {
    const refreshSecret = this.config.get<string>('jwt.refreshSecret');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET not configured');

    const refreshToken = jwt.sign({ sub: user.id }, refreshSecret, { expiresIn: '7d' });
    return ResultValue.ok(refreshToken);
  }


  async verifyRefreshToken(token: string): Promise<ResultValue<ID>> {
    const refreshSecret = this.config.get<string>('jwt.refreshSecret');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET not configured');
    try {
      const decoded = jwt.verify(token, refreshSecret) as { sub: string };
      if (!decoded?.sub) return ResultValue.error(new InvalidRefreshTokenError());
      const id = ID.from(decoded.sub);
      return ResultValue.ok(id);
    } catch (err) {
      console.error('JWT verification failed:', err);
      return ResultValue.error(new InvalidRefreshTokenError());
    }
  }
}
