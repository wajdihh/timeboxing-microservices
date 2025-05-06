import { TokenService } from '@identity/domain/auth/TokenService';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { ResultValue } from '@timeboxing/shared';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenServiceAdapter implements TokenService {
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
}
