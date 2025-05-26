import { Injectable } from '@nestjs/common';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { AuthResponseDto } from '../auth/dto/AuthResponseDto';
import { AuthMapper } from '../auth/dto/AuthMapper';

@Injectable()
export class GenerateAuthTokensService{
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute(user: UserEntity): Promise<AuthResponseDto> {
    const userId = user.id.value;
    const email = user.email.value;

    const [accessTokenResult, refreshTokenResult] = await Promise.all([
      this.tokenRepository.generateAccessToken(userId, email),
      this.tokenRepository.generateRefreshToken(userId),
    ]);

    const accessToken = accessTokenResult.unwrap();
    const refreshToken = refreshTokenResult.unwrap();

    return AuthMapper.toResponse(accessToken, refreshToken);
  }
}