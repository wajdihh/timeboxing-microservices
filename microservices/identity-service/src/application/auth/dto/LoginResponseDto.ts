export class LoginResponseDto {
    accessToken!: string;
    refreshToken!: string
      static sample(): LoginResponseDto {
        return {
          accessToken: 'abc-123-accc-123',
          refreshToken: 'abc-123'
        };
      }
    }