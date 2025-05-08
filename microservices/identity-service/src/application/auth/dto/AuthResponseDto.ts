export class AuthResponseDto {
    accessToken!: string;
    refreshToken!: string
      static sample(): AuthResponseDto {
        return {
          accessToken: 'abc-123-accc-123',
          refreshToken: 'abc-123'
        };
      }
    }