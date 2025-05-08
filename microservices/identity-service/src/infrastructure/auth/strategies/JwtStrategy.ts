import { PassportStrategy } from "@nestjs/passport";
import { StrategyType } from "./StrategyType";
import { ExtractJwt } from "passport-jwt";
import { JwtConfigService } from "src/config/JwtConfigService";
import { Injectable } from "@nestjs/common";
import { Strategy as PassportJwtStrategy } from 'passport-jwt';
import { UserRepository } from "@identity/domain/user/UserRepository";
import { ID, ResultValue } from "@timeboxing/shared";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { InvalidAccessTokenError } from "@identity/domain/auth/erros/InvalidAccessTokenError";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy, StrategyType.JWT) {
  constructor(
    private readonly jwtConfig: JwtConfigService,
    private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.getAccessSecret(),
    });
  }

  async validate(payload: { sub: string }) {
    const idResult = ID.from(payload.sub);
    if (idResult.isFail) return ResultValue.error(idResult.error);
    const idValue = idResult.unwrap();

    const userResult = await this.userRepository.findByID(idValue);
    if (userResult.isFail) return ResultValue.error(new InvalidAccessTokenError());
    const userValue = userResult.unwrap();
    if (!userValue) return ResultValue.error(new UserNotFoundError(idValue.value));
    return userValue;
  }
}