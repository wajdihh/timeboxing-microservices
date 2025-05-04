import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { SwaggerUseCase } from '@timeboxing/shared';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';

@Controller('user')
export class UserController {

  constructor(private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly getUserUseCase: GetUserUseCase
  ) {}

  @SwaggerUseCase(RegisterUserUseCase)
  @Post()
  async register(@Body() dto: RegisterUserRequestDto): Promise<UserResponseDto> {
    const response = await this.registerUserUseCase.execute(dto);
    return response.unwrap(); 
  }

  @SwaggerUseCase(GetUserUseCase)
  @Get()
  async getUser(@Query('email') email: string): Promise<UserResponseDto> {
    const response = await this.getUserUseCase.execute(email);
    return response.unwrap(); 
  }

  // ADD login with JWT 
  
}