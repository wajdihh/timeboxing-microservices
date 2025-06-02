import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { AuthMapper } from '@identity/application/auth/dto/AuthMapper';
import { AuthResponseDto } from '@identity/application/auth/dto/AuthResponseDto';
import { ID, ResultValue } from '@timeboxing/shared'; // Assuming this path is okay based on prior feedback

// Mock AuthMapper
jest.mock('@identity/application/auth/dto/AuthMapper');

describe('GenerateAuthTokensService', () => {
  let service: GenerateAuthTokensService;
  let mockTokenRepository: jest.Mocked<TokenRepository>;
  let mockUser: UserEntity;

  beforeEach(() => {
    mockTokenRepository = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      // Add other methods if TokenRepository interface requires them
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      decodeAccessToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<TokenRepository>;

    // Create a mock UserEntity instance
    // We need to mock the properties accessed by the service: id and email
    const userId = ID.fake();
    const userEmail = 'test@example.com';

    const userCreateResult = UserEntity.create('Test User', userEmail, 'hashedPassword');
    if (userCreateResult.isFail) {
      throw new Error('Failed to create mock UserEntity for test setup');
    }
    mockUser = {
        ...userCreateResult.unwrap(),
        id: userId, // Ensure the ID is the one we control for mocking
        email: { value: userEmail } // Ensure email.value is directly accessible
    } as UserEntity;


    service = new GenerateAuthTokensService(mockTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should generate access and refresh tokens and map them to AuthResponseDto', async () => {
    // Given
    const accessToken = 'mockAccessToken';
    const refreshToken = 'mockRefreshToken';
    const expectedDto: AuthResponseDto = { accessToken, refreshToken };

    mockTokenRepository.generateAccessToken.mockResolvedValue(ResultValue.ok(accessToken));
    mockTokenRepository.generateRefreshToken.mockResolvedValue(ResultValue.ok(refreshToken));
    (AuthMapper.toResponse as jest.Mock).mockReturnValue(expectedDto);

    // When
    const result = await service.execute(mockUser);

    // Then
    expect(mockTokenRepository.generateAccessToken).toHaveBeenCalledWith(mockUser.id.value, mockUser.email.value);
    expect(mockTokenRepository.generateRefreshToken).toHaveBeenCalledWith(mockUser.id.value);
    expect(AuthMapper.toResponse).toHaveBeenCalledWith(accessToken, refreshToken);
    expect(result).toEqual(expectedDto);
  });
});
