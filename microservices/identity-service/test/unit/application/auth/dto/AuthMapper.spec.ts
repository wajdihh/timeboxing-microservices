import { AuthMapper } from '@identity/application/auth/dto/AuthMapper';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';

describe('AuthMapper', () => {
  describe('toResponse', () => {
    it('should map accessToken and refreshToken to AuthResponseDto', () => {
      // Given
      const accessToken = 'sampleAccessToken';
      const refreshToken = 'sampleRefreshToken';

      // When
      const result: AuthResponseDto = AuthMapper.toResponse(accessToken, refreshToken);

      // Then
      expect(result).toBeDefined();
      expect(result.accessToken).toBe(accessToken);
      expect(result.refreshToken).toBe(refreshToken);
    });

    it('should handle empty token strings', () => {
      // Given
      const accessToken = '';
      const refreshToken = '';

      // When
      const result: AuthResponseDto = AuthMapper.toResponse(accessToken, refreshToken);

      // Then
      expect(result).toBeDefined();
      expect(result.accessToken).toBe('');
      expect(result.refreshToken).toBe('');
    });
  });
});
