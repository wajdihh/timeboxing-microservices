import { PassportStrategy } from "@nestjs/passport";
import { StrategyType } from "./StrategyType";
import { ExtractJwt } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { Strategy as PassportJwtStrategy } from 'passport-jwt';
import { UserRepository } from "@identity/domain/user/UserRepository";
import { ID } from "@timeboxing/shared";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { InvalidAccessTokenError } from "@identity/domain/auth/erros/InvalidAccessTokenError";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { JwtConfigService } from "@identity/config/JwtConfigService";

@Injectable()
export class JwtStrategy extends PassportStrategy(PassportJwtStrategy, StrategyType.JWT) {
  constructor(
    private readonly jwtConfig: JwtConfigService,
    private readonly userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConfig.getAccessSecret(),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: { sub: string }): Promise<UserEntity> {
    const idResult = ID.from(payload.sub);
    if (idResult.isFail) {
      throw new InvalidAccessTokenError();
    }

    const userResult = await this.userRepository.findByID(idResult.unwrap());
    if (userResult.isFail) {
      throw new InvalidAccessTokenError();
    }

    const user = userResult.unwrap();
    if (!user) {
      throw new UserNotFoundError(payload.sub);
    }
    return user;
  }
}