import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class RefreshTokenRequestDto {
  @IsString({ message: 'refreshToken must be a string' })
  @IsNotEmpty({ message: 'refreshToken cannot be empty' })
  @Matches(/^[\w-]+\.[\w-]+\.[\w-]+$/, {
    message: 'refreshToken must be a valid JWT',
  })
  refreshToken!: string;

  static sample(): RefreshTokenRequestDto {
    return {
      refreshToken: 'abc-123'
    };
  }
}
