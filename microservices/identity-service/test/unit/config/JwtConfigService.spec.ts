import { JwtConfigService, JWT_CONFIG_KEYS } from '@identity/config/JwtConfigService';
import { ConfigService } from '@nestjs/config';

describe('JwtConfigService', () => {
  let jwtConfigService: JwtConfigService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    // Create a mock for ConfigService
    // jest.fn() can be used for each method we expect to be called.
    mockConfigService = {
      get: jest.fn(),
      getOrThrow: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>; // Cast to allow partial mock

    jwtConfigService = new JwtConfigService(mockConfigService);
  });

  describe('getAccessSecret', () => {
    it('should return the access secret from ConfigService', () => {
      const expectedSecret = 'testAccessSecret';
      mockConfigService.getOrThrow.mockReturnValue(expectedSecret);

      const secret = jwtConfigService.getAccessSecret();

      expect(secret).toBe(expectedSecret);
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(JWT_CONFIG_KEYS.secret);
    });

    it('should throw if access secret is not found by getOrThrow', () => {
      const errorMessage = 'Access secret not found';
      mockConfigService.getOrThrow.mockImplementation(() => {
        throw new Error(errorMessage);
      });

      expect(() => jwtConfigService.getAccessSecret()).toThrow(errorMessage);
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(JWT_CONFIG_KEYS.secret);
    });
  });

  describe('getRefreshSecret', () => {
    it('should return the refresh secret from ConfigService', () => {
      const expectedSecret = 'testRefreshSecret';
      mockConfigService.getOrThrow.mockReturnValue(expectedSecret);

      const secret = jwtConfigService.getRefreshSecret();

      expect(secret).toBe(expectedSecret);
      expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(JWT_CONFIG_KEYS.refreshSecret);
    });

    it('should throw if refresh secret is not found by getOrThrow', () => {
        const errorMessage = 'Refresh secret not found';
        mockConfigService.getOrThrow.mockImplementation(() => {
          throw new Error(errorMessage);
        });
  
        expect(() => jwtConfigService.getRefreshSecret()).toThrow(errorMessage);
        expect(mockConfigService.getOrThrow).toHaveBeenCalledWith(JWT_CONFIG_KEYS.refreshSecret);
      });
  });

  describe('getAccessExpiresIn', () => {
    it('should return the access expiresIn from ConfigService if set', () => {
      const expectedExpiresIn = '30m';
      mockConfigService.get.mockReturnValue(expectedExpiresIn);

      const expiresIn = jwtConfigService.getAccessExpiresIn();

      expect(expiresIn).toBe(expectedExpiresIn);
      expect(mockConfigService.get).toHaveBeenCalledWith(JWT_CONFIG_KEYS.expiresIn);
    });

    it('should return default "15m" if access expiresIn is not set in ConfigService', () => {
      mockConfigService.get.mockReturnValue(undefined); // Simulate not set

      const expiresIn = jwtConfigService.getAccessExpiresIn();

      expect(expiresIn).toBe('15m');
      expect(mockConfigService.get).toHaveBeenCalledWith(JWT_CONFIG_KEYS.expiresIn);
    });
  });

  describe('getRefreshExpiresIn', () => {
    it('should return the refresh expiresIn from ConfigService if set', () => {
      const expectedExpiresIn = '14d';
      mockConfigService.get.mockReturnValue(expectedExpiresIn);

      const expiresIn = jwtConfigService.getRefreshExpiresIn();

      expect(expiresIn).toBe(expectedExpiresIn);
      expect(mockConfigService.get).toHaveBeenCalledWith(JWT_CONFIG_KEYS.refreshExpiresIn);
    });

    it('should return default "7d" if refresh expiresIn is not set in ConfigService', () => {
      mockConfigService.get.mockReturnValue(undefined); // Simulate not set

      const expiresIn = jwtConfigService.getRefreshExpiresIn();

      expect(expiresIn).toBe('7d');
      expect(mockConfigService.get).toHaveBeenCalledWith(JWT_CONFIG_KEYS.refreshExpiresIn);
    });
  });

  describe('getRefreshTtlSeconds', () => {
    beforeEach(() => {
        // Reset the mock for 'get' specifically for these tests if needed,
        // or ensure it's flexible enough.
        // For getRefreshTtlSeconds, it calls getRefreshExpiresIn, which uses mockConfigService.get
    });

    it('should parse numeric string as seconds', () => {
      mockConfigService.get.mockReturnValue('3600');
      expect(jwtConfigService.getRefreshTtlSeconds()).toBe(3600);
    });

    it('should parse "s" unit correctly', () => {
      mockConfigService.get.mockReturnValue('120s');
      expect(jwtConfigService.getRefreshTtlSeconds()).toBe(120);
    });

    it('should parse "m" unit correctly', () => {
      mockConfigService.get.mockReturnValue('10m');
      expect(jwtConfigService.getRefreshTtlSeconds()).toBe(10 * 60);
    });

    it('should parse "h" unit correctly', () => {
      mockConfigService.get.mockReturnValue('2h');
      expect(jwtConfigService.getRefreshTtlSeconds()).toBe(2 * 60 * 60);
    });

    it('should parse "d" unit correctly', () => {
      mockConfigService.get.mockReturnValue('3d');
      expect(jwtConfigService.getRefreshTtlSeconds()).toBe(3 * 60 * 60 * 24);
    });
    
    it('should use default "7d" if config value is undefined and parse it', () => {
        mockConfigService.get.mockReturnValue(undefined);
        expect(jwtConfigService.getRefreshTtlSeconds()).toBe(7 * 24 * 60 * 60);
    });

    it('should trim whitespace before parsing', () => {
        mockConfigService.get.mockReturnValue('  20m  ');
        expect(jwtConfigService.getRefreshTtlSeconds()).toBe(20 * 60);
    });

    it('should throw error for invalid format', () => {
      mockConfigService.get.mockReturnValue('invalid-format');
      expect(() => jwtConfigService.getRefreshTtlSeconds()).toThrow('Invalid refreshExpiresIn format: "invalid-format"');
    });

    it('should throw error for unsupported unit', () => {
      mockConfigService.get.mockReturnValue('5y'); // y for years is not supported
      expect(() => jwtConfigService.getRefreshTtlSeconds()).toThrow('Invalid refreshExpiresIn format: "5y"');
    });
  });
});
