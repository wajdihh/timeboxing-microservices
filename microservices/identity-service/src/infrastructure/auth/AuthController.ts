import { Controller, Post, UseGuards, Req, Inject } from '@nestjs/common';
import { SwaggerUseCase } from '@timeboxing/shared';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { LoginResponseDto } from '@identity/application/auth/dto/LoginResponseDto';
import { AuthGuard } from '@nestjs/passport';
import { LoginMapper } from '@identity/application/auth/dto/LoginMapper';
import { TOKEN_REPOSITORY, TokenRepository } from '@identity/domain/auth/TokenRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { StrategyType } from './strategies/StrategyType';


interface RequestWithUser extends Request {
  user: UserEntity;
}

@Controller('auth')
export class AuthController {

  constructor(@Inject(TOKEN_REPOSITORY) private readonly tokenRepository: TokenRepository) { }

  @SwaggerUseCase(LoginUseCase)
  @UseGuards(AuthGuard(StrategyType.LOCAL))
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<LoginResponseDto> {

    const user = req.user;
    const userId = user.id.value;
    const email = user.email.value;

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenRepository.generateAccessToken(userId, email),
      this.tokenRepository.generateRefreshToken(userId)
    ]);

    const accessTokenValue = accessTokenResult.unwrap();
    const refreshTokenValue = refreshTokenResult.unwrap();

    await this.tokenRepository.saveRefreshToken(userId, refreshTokenValue);

    const response = LoginMapper.toResponse(accessTokenValue, refreshTokenValue);
    return response;
  }
}