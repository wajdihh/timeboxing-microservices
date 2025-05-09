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

  async validate(email: string, password: string): Promise<UserEntity | null> {
    //null because passort will throw 500 error if we use domain exceptions and null = 401
    const loginRequestDto = { email, password };
    const response = await this.loginUseCase.execute(loginRequestDto);
    if (response.isFail || !response.unwrap()) return null
    return response.unwrap();
  }
}
