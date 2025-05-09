import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from '../StrategyType';
import { ApiHeader, ApiResponse } from '@nestjs/swagger';
import { InvalidRefreshTokenError } from '@identity/domain/auth/erros/InvalidRefreshTokenError';
import { RefreshStrategy } from '../RefreshStrategy';

export function HeaderRefreshToken(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    UseGuards(AuthGuard(StrategyType.REFRESH)),
    ApiHeader({
      name: RefreshStrategy.headerKey,
      description: 'Refresh token',
      required: true,
    }),
    ApiResponse({
      status: InvalidRefreshTokenError.statusCode,
      description: InvalidRefreshTokenError.swaggerMessage,
    })
  );
}