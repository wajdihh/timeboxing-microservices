import { LogoutUseCase } from '@identity/application/auth/LogoutUseCase';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';
import { ID, ResultValue } from '@timeboxing/shared';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockTokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    mockTokenRepository = {
      verifyRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      generateAuthTokens: jest.fn(),
      verifyAccessToken: jest.fn(),
      decodeAccessToken: jest.fn(), 
    } as unknown as jest.Mocked<TokenRepository>;

    useCase = new LogoutUseCase(mockTokenRepository);
  });

  it('should successfully logout if refresh token is valid and revocation succeeds', async () => {
    // Given
    const refreshToken = 'valid-refresh-token';
    const userId = ID.fake();
    const sessionId = 'session-id';

    mockTokenRepository.verifyRefreshToken.mockResolvedValue(
      ResultValue.ok({ userId, sessionID: sessionId, email: 'test@example.com', username: 'testuser' }),
    );
    mockTokenRepository.revokeRefreshToken.mockResolvedValue(ResultValue.ok(undefined));

    // When
    const result = await useCase.execute(refreshToken);

    // Then
    expect(result.isOk).toBe(true);
    expect(mockTokenRepository.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(userId.value, sessionId);
  });

  it('should return InvalidRefreshTokenError if token verification fails', async () => {
    // Given
    const refreshToken = 'invalid-refresh-token';
    mockTokenRepository.verifyRefreshToken.mockResolvedValue(
      ResultValue.error(new InvalidRefreshTokenError()),
    );

    // When
    const result = await useCase.execute(refreshToken);

    // Then
    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidRefreshTokenError);
    expect(mockTokenRepository.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockTokenRepository.revokeRefreshToken).not.toHaveBeenCalled();
  });

  it('should return InvalidRefreshTokenError if token revocation fails', async () => {
    // Given
    const refreshToken = 'valid-refresh-token';
    const userId = ID.fake();
    const sessionId = 'session-id';

    mockTokenRepository.verifyRefreshToken.mockResolvedValue(
      ResultValue.ok({ userId, sessionID: sessionId, email: 'test@example.com', username: 'testuser' }),
    );
    mockTokenRepository.revokeRefreshToken.mockResolvedValue(
      ResultValue.error(new InvalidRefreshTokenError()),
    );

    // When
    const result = await useCase.execute(refreshToken);

    // Then
    expect(result.isOk).toBe(false);
    expect(result.error).toBeInstanceOf(InvalidRefreshTokenError);
    expect(mockTokenRepository.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
    expect(mockTokenRepository.revokeRefreshToken).toHaveBeenCalledWith(userId.value, sessionId);
  });
});
