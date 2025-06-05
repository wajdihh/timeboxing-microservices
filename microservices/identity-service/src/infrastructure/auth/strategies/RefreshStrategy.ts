// src/infrastructure/auth/strategies/RefreshStrategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { StrategyType } from './StrategyType';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { RequestWithRefreshTokenValue } from './helpers/RequestWithRefreshTokenValue';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, StrategyType.REFRESH) {
  constructor(private readonly refreshUseCase: RefreshTokenUseCase) {
    super();
  }

  async validate(req: Request): Promise<UserEntity> {
    const token = req.headers[RefreshStrategy.headerKey];
    if (!token || typeof token !== 'string') throw new InvalidRefreshTokenError();
    (req as RequestWithRefreshTokenValue).refreshToken = token;
    const resultUser = await this.refreshUseCase.execute(token);
    if (resultUser.isFail || !resultUser.unwrap()) throw resultUser.error;
    return resultUser.unwrap();
  }

  static headerKey = 'x-refresh-token';
}