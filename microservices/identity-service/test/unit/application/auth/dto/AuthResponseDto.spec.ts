import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';

describe('AuthResponseDto', () => {
  describe('sample', () => {
    it('should return a sample AuthResponseDto object', () => {
      // When
      const sampleDto = AuthResponseDto.sample();

      // Then
      expect(sampleDto).toBeDefined();
      expect(typeof sampleDto.accessToken).toBe('string');
      expect(typeof sampleDto.refreshToken).toBe('string');
      // Check for specific sample values if they are constant
      expect(sampleDto.accessToken).toBe('abc-123-accc-123');
      expect(sampleDto.refreshToken).toBe('abc-123');
    });
  });

  describe('structure', () => {
    it('should be instantiable and have correct properties', () => {
        // Given
        const dto = new AuthResponseDto();
        
        dto.accessToken = "testAccess";
        dto.refreshToken = "testRefresh";

        expect(dto.accessToken).toBe("testAccess");
        expect(dto.refreshToken).toBe("testRefresh");
    });
  });
});
