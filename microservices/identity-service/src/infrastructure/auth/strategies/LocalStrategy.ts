import { LoginUseCase } from "@identity/application/auth/LoginUseCase";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { StrategyType } from "./StrategyType";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, StrategyType.LOCAL) {
  constructor(private readonly loginUseCase: LoginUseCase) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<UserEntity> {
    const loginRequestDto = { email, password };
    const response = await this.loginUseCase.execute(loginRequestDto);
    return response.unwrap();
  }
}
