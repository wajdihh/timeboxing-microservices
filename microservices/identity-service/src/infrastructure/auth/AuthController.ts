import { Controller, Post, Req, HttpCode, Body, HttpException, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler'; // ThrottlerGuard import removed
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
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';
import { UserMapper } from '@identity/application/user/dto/UserMapper';

@Controller('auth')
export class AuthController {

  constructor(
    private readonly generateAuthTokensService: GenerateAuthTokensService,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) { }

  @Throttle({ default: { limit: 10, ttl: 60000 } }) // Override default 10 requests per minute
  @SwaggerUseCase(LoginUseCase)
  @AddLocalGuard()
  @Post('login')
  async login(@Req() req: RequestWithUser): Promise<AuthResponseDto> {
    return this.generateAuthTokensService.execute(req.user);
  }

  // @UseGuards(ThrottlerGuard) removed, relying on global guard
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // Override default 3 requests per minute
  @SwaggerUseCase(RegisterUserUseCase)
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserRequestDto): Promise<UserResponseDto> {
    const userEntityResult = await this.registerUserUseCase.execute(registerUserDto);
    if (userEntityResult.isFail) { 
      throw new HttpException(userEntityResult.error.message, HttpStatus.BAD_REQUEST);
    }
    return UserMapper.toResponse(userEntityResult.unwrap());
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
