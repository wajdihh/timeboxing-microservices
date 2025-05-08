import { AuthResponseDto } from "./AuthResponseDto";

export class AuthMapper {

  static toResponse(accessToken: string, refreshToken: string): AuthResponseDto {
    return {
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
}