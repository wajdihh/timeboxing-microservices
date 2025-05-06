import { Controller, Post, Body } from '@nestjs/common';
import { SwaggerUseCase } from '@timeboxing/shared';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { LoginRequestDto } from '@identity/application/auth/dto/LoginRequestDto';
import { LoginResponseDto } from '@identity/application/auth/dto/LoginResponseDto';

@Controller('auth')
export class AuthController {

  constructor(private readonly loginUseCase: LoginUseCase) {}

  @SwaggerUseCase(LoginUseCase)
  @Post('/login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    const response = await this.loginUseCase.execute(dto);
    return response.unwrap(); 
  }
}