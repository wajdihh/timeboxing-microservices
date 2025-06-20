import { Controller, Post, Body, Get, Query, Req, Delete } from '@nestjs/common';
import { RegisterUserRequestDto } from '@identity/application/user/dto/RegisterUserRequestDto';
import { RegisterUserUseCase } from '@identity/application/user/RegisterUserUseCase';
import { SwaggerUseCase } from '@timeboxing/shared';
import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';
import { GetUserUseCase } from '@identity/application/user/GetUserUseCase';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';
import { RequestWithUser } from '../auth/strategies/helpers/RequestWithUserValue';
import { UserMapper } from '@identity/application/user/dto/UserMapper';
import { ProtectByAuthGuard } from '../auth/strategies/helpers/JwtProtectByAuthGuardDecorator';
import { DeleteUserUseCase } from '@identity/application/user/DeleteUserUseCase';

@Controller('user')
export class UserController {

  constructor(private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly generateTokensForUserService: GenerateAuthTokensService,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase) {}

  @SwaggerUseCase(RegisterUserUseCase)
  @Post()
  async register(@Body() dto: RegisterUserRequestDto): Promise<AuthResponseDto> {
    const userResult = await this.registerUserUseCase.execute(dto);
    const user = userResult.unwrap();
    return this.generateTokensForUserService.execute(user);
  }

  @SwaggerUseCase(GetUserUseCase)
  @Get()
  async getUser(@Query('id') id: string): Promise<UserResponseDto> {
    const response = await this.getUserUseCase.execute(id);
    return response.unwrap(); 
  }  

  @ProtectByAuthGuard()
  @Get('me')
  @SwaggerUseCase(GetUserUseCase)
  async getCurrentUser(@Req() req: RequestWithUser): Promise<UserResponseDto> {
    return UserMapper.toResponse(req.user);
  }

  @ProtectByAuthGuard()
  @Delete('me')
  @SwaggerUseCase(DeleteUserUseCase)
  async deleteCurrentUser(@Req() req: RequestWithUser): Promise<void> {
    const id = req.user.id.value;
    const result = await this.deleteUserUseCase.execute(id);
    result.unwrap();
  }
}
