import { Controller, Post, Body } from '@nestjs/common';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { SwaggerUseCase } from '@timeboxing/shared';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';

@Controller('user')
export class UserController {

  constructor(private readonly registerUserUseCase: RegisterUserUseCase) {}

  @SwaggerUseCase(RegisterUserUseCase)
  @Post()
  async register(@Body() dto: RegisterUserRequestDto): Promise<UserResponseDto> {
    const response = await this.registerUserUseCase.execute(dto);
    return response.unwrap(); 
  }
}