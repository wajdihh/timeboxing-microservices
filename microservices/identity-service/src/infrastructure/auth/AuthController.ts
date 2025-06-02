import { Controller, Post, Req, HttpCode } from '@nestjs/common';
import { SwaggerUseCase } from '@timeboxing/shared';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';
import { RequestWithUser } from './strategies/helpers/RequestWithUserValue';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';
import { AddHeaderRefreshToken } from './strategies/helpers/JwtAddHeaderRefreshTokenDecorator';
import { LogoutUseCase } from '@identity/application/auth/LogoutUseCase';
import { RequestWithRefreshTokenValue } from './strategies/helpers/RequestWithRefreshTokenValue';
import { AddLocalGuard } from './strategies/helpers/JwtAddLocalGuardDecorator';

@Controller('auth')
export class AuthController {

  constructor(private readonly generateAuthTokensService: GenerateAuthTokensService,
    private readonly logoutUseCase: LogoutUseCase
  ) { }

  @SwaggerUseCase(LoginUseCase)
  @AddLocalGuard()
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthResponseDto> {
    return this.generateAuthTokensService.execute(req.user);
  }

  @AddHeaderRefreshToken()
  @SwaggerUseCase(RefreshTokenUseCase)
  @Post('refresh')
  async refresh(@Req() req: RequestWithUser): Promise<AuthResponseDto> {
    return this.generateAuthTokensService.execute(req.user);
  }

  @AddHeaderRefreshToken()
  @SwaggerUseCase(LogoutUseCase)
  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: RequestWithRefreshTokenValue): Promise<void> {
    await this.logoutUseCase.execute(req.refreshToken);
    return ; // Return nothing to trigger 201 by Nest
  }
}
