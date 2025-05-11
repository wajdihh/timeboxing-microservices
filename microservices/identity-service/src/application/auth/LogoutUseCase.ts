import { Injectable } from "@nestjs/common";
import { AuthTokenType, ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { TokenRepository } from "@identity/domain/auth/TokenRepository";
import { InvalidRefreshTokenError } from "@identity/domain/auth/erros/InvalidRefreshTokenError";

@SwaggerUseCaseMetadata({
    errors: [InvalidRefreshTokenError],
    successStatus: SuccessStatus.NO_CONTENT,
    authTokenType: AuthTokenType.RefreshToken
})

@Injectable()
export class LogoutUseCase {
    constructor(private readonly tokenRepository: TokenRepository) { }

    async execute(refreshToken: string): Promise<ResultValue<void, InvalidRefreshTokenError>> {
        const idResult = await this.tokenRepository.verifyRefreshToken(refreshToken);
        if (idResult.isFail) return ResultValue.error(new InvalidRefreshTokenError());

        const id = idResult.unwrap();
        const result = await this.tokenRepository.revokeRefreshToken(id.value, refreshToken);
        if (ResultValue.isFail(result)) return ResultValue.error(new InvalidRefreshTokenError());
        return ResultValue.ok();
    }
}