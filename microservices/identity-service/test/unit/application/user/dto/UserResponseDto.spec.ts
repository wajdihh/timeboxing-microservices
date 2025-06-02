import { UserResponseDto } from '@identity/application/user/dto/UserResponseDto';

describe('UserResponseDto', () => {
  describe('sample', () => {
    it('should return a sample UserResponseDto object', () => {
      // When
      const sampleDto = UserResponseDto.sample();

      // Then
      expect(sampleDto).toBeDefined();
      expect(sampleDto.id).toBe('abc-123');
      expect(sampleDto.name).toBe('John Doe');
      expect(sampleDto.email).toBe('john@example.com');
      // Check that createdAt is a valid ISO string (or a specific value if predictable)
      expect(typeof sampleDto.createdAt).toBe('string');
      // Optionally, check if it's a valid date string
      expect(!isNaN(new Date(sampleDto.createdAt).getTime())).toBe(true);
    });
  });

  describe('structure', () => {
    it('should be instantiable and have correct properties', () => {
        const dto = new UserResponseDto();
        dto.id = "testId";
        dto.name = "Test Name";
        dto.email = "name@example.com";
        dto.createdAt = new Date().toISOString();

        expect(dto.id).toBe("testId");
        expect(dto.name).toBe("Test Name");
        expect(dto.email).toBe("name@example.com");
        expect(typeof dto.createdAt).toBe('string');
    });
  });
});
