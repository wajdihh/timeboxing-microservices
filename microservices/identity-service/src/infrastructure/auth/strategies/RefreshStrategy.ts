// src/infrastructure/auth/strategies/RefreshStrategy.ts
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { StrategyType } from './StrategyType';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { RequestWithRefreshTokenValue } from './helpers/RequestWithRefreshTokenValue';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, StrategyType.REFRESH) {
  constructor(private readonly refreshUseCase: RefreshTokenUseCase) {
    super();
  }

  async validate(req: Request): Promise<UserEntity | null> {
    //null because passort will throw 500 error if we use domain exceptions and null = 401
    const token = req.headers[RefreshStrategy.headerKey];
    if (!token || typeof token !== 'string') return null;
    (req as RequestWithRefreshTokenValue).refreshToken = token;
    const resultUser = await this.refreshUseCase.execute(token);
    if (resultUser.isFail || !resultUser.unwrap()) return null
    return resultUser.unwrap();
  }

  static headerKey = 'x-refresh-token';
}