import { EmailValue } from '@identity/domain/user/value-objects/EmailValue';
import { InvalidEmailError } from '@identity/domain/user/errors/InvalidEmailError';

describe('EmailValue', () => {
  describe('create', () => {
    it('should create an EmailValue for a valid email string', () => {
      const validEmail = 'test@example.com';
      const result = EmailValue.create(validEmail);
      expect(result.isOk).toBe(true);
      const emailValue = result.unwrap();
      expect(emailValue).toBeInstanceOf(EmailValue);
      expect(emailValue.value).toBe(validEmail.toLowerCase());
    });

    it('should convert email to lowercase', () => {
      const mixedCaseEmail = 'Test@Example.COM';
      const result = EmailValue.create(mixedCaseEmail);
      expect(result.isOk).toBe(true);
      expect(result.unwrap().value).toBe(mixedCaseEmail.toLowerCase());
    });

    it('should return an InvalidEmailError for an invalid email string', () => {
      const invalidEmail = 'not-an-email';
      const result = EmailValue.create(invalidEmail);
      expect(result.isOk).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidEmailError);
      expect(result.error?.message).toContain(invalidEmail);
    });

    it('should return an InvalidEmailError for an empty string', () => {
      const emptyEmail = '';
      const result = EmailValue.create(emptyEmail);
      expect(result.isOk).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidEmailError);
    });

    // Add more test cases for edge cases of isValidEmail if needed to cover line 19
    it('should handle emails with subdomains', () => {
      const emailWithSubdomain = 'test@sub.example.com';
      const result = EmailValue.create(emailWithSubdomain);
      expect(result.isOk).toBe(true);
      expect(result.unwrap().value).toBe(emailWithSubdomain);
    });

    it('should handle emails with plus alias', () => {
      const emailWithPlus = 'test+alias@example.com';
      const result = EmailValue.create(emailWithPlus);
      expect(result.isOk).toBe(true);
      expect(result.unwrap().value).toBe(emailWithPlus);
    });
    
    it('should reject email without TLD', () => {
      const emailNoTld = 'test@example';
      const result = EmailValue.create(emailNoTld);
      expect(result.isOk).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidEmailError);
    });

    it('should reject email without @ symbol', () => {
      const emailNoAt = 'testexample.com';
      const result = EmailValue.create(emailNoAt);
      expect(result.isOk).toBe(false);
      expect(result.error).toBeInstanceOf(InvalidEmailError);
    });
  });

  describe('equals', () => {
    it('should return true for equal EmailValue objects', () => {
      const email1 = EmailValue.create('test@example.com').unwrap();
      const email2 = EmailValue.create('test@example.com').unwrap();
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for equal EmailValue objects with different casing', () => {
      const email1 = EmailValue.create('Test@Example.com').unwrap();
      const email2 = EmailValue.create('test@example.com').unwrap();
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different EmailValue objects', () => {
      const email1 = EmailValue.create('test1@example.com').unwrap();
      const email2 = EmailValue.create('test2@example.com').unwrap();
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
