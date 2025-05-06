import { LoginResponseDto } from "./LoginResponseDto";

export class LoginMapper {

  static toResponse(accessToken: string, refreshToken: string): LoginResponseDto {
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}