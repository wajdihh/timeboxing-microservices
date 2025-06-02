import { LoginRequestDto } from '@identity/application/auth/dto/LoginRequestDto';
import { UserFactory } from '@timeboxing/shared';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('LoginRequestDto', () => {
  describe('sample', () => {
    it('should return a sample LoginRequestDto object', () => {
      // When
      const sampleDto = LoginRequestDto.sample();
      const userFake = UserFactory.wajdi(); // To compare against

      // Then
      expect(sampleDto).toBeDefined();
      expect(sampleDto.email).toBe(userFake.email);
      expect(sampleDto.password).toBe(userFake.password);
    });
  });

  describe('validation and transformation', () => {
    it('should validate a correct DTO', async () => {
      const dto = plainToInstance(LoginRequestDto, {
        email: ' test@example.com ', // Test trimming and lowercasing
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(dto.email).toBe('test@example.com'); // Check transformation
    });

    it('should fail validation for invalid email', async () => {
      const dto = plainToInstance(LoginRequestDto, {
        email: 'not-an-email',
        password: 'password123',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('email');
      expect(errors[0]?.constraints?.isEmail).toBeDefined();
    });

    it('should fail validation for password too short', async () => {
      const dto = plainToInstance(LoginRequestDto, {
        email: 'test@example.com',
        password: 'short', // Less than 8 chars
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('password');
      expect(errors[0]?.constraints?.isLength).toBeDefined();
    });

    it('should fail validation for password too long', async () => {
      const dto = plainToInstance(LoginRequestDto, {
        email: 'test@example.com',
        password: 'a'.repeat(33), // More than 32 chars
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.property).toBe('password');
      expect(errors[0]?.constraints?.isLength).toBeDefined(); 
    });

    it('should transform email to lowercase and trim whitespace', () => {
        const dto = plainToInstance(LoginRequestDto, {
            email: '  TestEmail@Example.COM  ',
            password: 'validPassword123'
        });
 
        expect(dto.email).toBe('testemail@example.com');
    });
  });
});
