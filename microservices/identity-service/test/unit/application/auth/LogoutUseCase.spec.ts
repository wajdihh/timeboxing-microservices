import { LogoutUseCase } from '@identity/application/auth/LogoutUseCase';
import { TokenRepository } from '@identity/domain/auth/TokenRepository';
import { MetricsPort } from '@identity/application/observability/MetricsPort';
import { InvalidRefreshTokenError } from '@identity/domain/auth/errors/InvalidRefreshTokenError';
import { ID, ResultValue } from '@timeboxing/shared';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;
  let mockTokenRepository: jest.Mocked<TokenRepository>;
  let mockMetricsPort: jest.Mocked<MetricsPort>;

  beforeEach(() => {
    mockTokenRepository = {
      verifyRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
      // generateAuthTokens: jest.fn(), // Not used by LogoutUseCase
      // verifyAccessToken: jest.fn(), // Not used by LogoutUseCase
      // decodeAccessToken: jest.fn(), // Not used by LogoutUseCase
    } as unknown as jest.Mocked<TokenRepository>;

    mockMetricsPort = {
        incrementRegistration: jest.fn(),
        incrementLogin: jest.fn(),
        incrementLogout: jest.fn(),
        incrementRefreshToken: jest.fn(),
        getMetrics: jest.fn(),
        startRequestTimer: jest.fn().mockReturnValue(jest.fn()),
        incrementRequestCounter: jest.fn(),
        incrementErrorCounter: jest.fn(),
    } as jest.Mocked<MetricsPort>;

    useCase = new LogoutUseCase(mockTokenRepository, mockMetricsPort);
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
    expect(mockMetricsPort.incrementLogout).toHaveBeenCalled();
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
