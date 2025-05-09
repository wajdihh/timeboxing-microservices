import { PassportStrategy } from "@nestjs/passport";
import { StrategyType } from "./StrategyType";
import { ExtractJwt } from "passport-jwt";
import { Injectable } from "@nestjs/common";
import { Strategy as PassportJwtStrategy } from 'passport-jwt';
import { UserRepository } from "@identity/domain/user/UserRepository";
import { ID } from "@timeboxing/shared";
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

  async validate(payload: { sub: string }): Promise<UserEntity | null> {
    //null because passort will throw 500 error if we use domain exceptions and null = 401
    const idResult = ID.from(payload.sub);
    if (idResult.isFail) return null

    const userResult = await this.userRepository.findByID(idResult.unwrap());
    if (userResult.isFail || !userResult.unwrap()) return null
    const user = userResult.unwrap();
    return user;
  }
}