import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { AuthTokenType, ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { TokenRepository } from "@identity/domain/auth/TokenRepository";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { InvalidRefreshTokenError } from "@identity/domain/auth/erros/InvalidRefreshTokenError";
import { AuthMapper } from "./dto/AuthMapper";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError, InvalidRefreshTokenError],
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
    authTokenType: AuthTokenType.AccessToken
})

@Injectable()
export class RefreshTokenUseCase {
    constructor(private readonly userRepository: UserRepository, private readonly tokenRepository: TokenRepository) { }

    async execute(refreshToken: string): Promise<ResultValue<AuthResponseDto, UserNotFoundError | InvalidRefreshTokenError>> {

        const idResult = await this.tokenRepository.verifyRefreshToken(refreshToken);
        if (idResult.isFail) return ResultValue.error(new InvalidRefreshTokenError())

        const id = idResult.unwrap();        
        const userResult = await this.userRepository.findByID(id)
        if (userResult.isFail) {
            return ResultValue.error(new UserNotFoundError(id.value));
        }

        const userValue = userResult.unwrap();
        if (!userValue) {
            return ResultValue.error(new UserNotFoundError(id.value));
        }

        const [accessTokenResult, refreshTokenResult] = await Promise.all([
            this.tokenRepository.generateAccessToken('userValue', ''),
            this.tokenRepository.generateRefreshToken('userValue')
        ]);

        if (accessTokenResult.isFail) return ResultValue.error(accessTokenResult.error);
        if (refreshTokenResult.isFail) return ResultValue.error(refreshTokenResult.error);

        const accessTokenValue = accessTokenResult.unwrap();
        const refreshTokenValue = refreshTokenResult.unwrap();
        const response = AuthMapper.toResponse(accessTokenValue, refreshTokenValue);

        return ResultValue.ok(response);
    }
}