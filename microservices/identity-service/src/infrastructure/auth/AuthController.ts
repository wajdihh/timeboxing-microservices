import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { SwaggerUseCase } from '@timeboxing/shared';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';
import { AuthGuard } from '@nestjs/passport';
import { StrategyType } from './strategies/StrategyType';
import { RequestWithUser } from './strategies/RequestWithUserValue';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';

@Controller('auth')
export class AuthController {

  constructor(private readonly generateAuthTokensService: GenerateAuthTokensService) { }

  @SwaggerUseCase(LoginUseCase)
  @UseGuards(AuthGuard(StrategyType.LOCAL))
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthResponseDto> {
    return this.generateAuthTokensService.execute(req.user);
  }
}