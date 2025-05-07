import { Controller, Post, Body } from '@nestjs/common';
import { SwaggerUseCase } from '@timeboxing/shared';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { LoginRequestDto } from '@identity/application/auth/dto/LoginRequestDto';
import { LoginResponseDto } from '@identity/application/auth/dto/LoginResponseDto';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';
import { RefreshTokenRequestDto } from '@identity/application/auth/dto/RefreshTokenRequestDto';

@Controller('auth')
export class AuthController {

  constructor(private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase
  ) { }

  @SwaggerUseCase(LoginUseCase)
  @Post('/login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await this.loginUseCase.execute(dto);
    return response.unwrap();
  }

  @SwaggerUseCase(RefreshTokenUseCase)
  @Post('/refresh')
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<LoginResponseDto> {
    const result = await this.refreshTokenUseCase.execute(dto);
    return result.unwrap();
  }
}