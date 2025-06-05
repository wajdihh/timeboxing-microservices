import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { AuthTokenType, ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { TokenRepository } from "@identity/domain/auth/TokenRepository";
import { InvalidRefreshTokenError } from "@identity/domain/auth/errors/InvalidRefreshTokenError";
import { UserEntity } from "@identity/domain/user/UserEntity";
import { InvalidSessionError } from "@identity/domain/auth/errors/InvalidSessionError";

@SwaggerUseCaseMetadata({
    errors: [InvalidRefreshTokenError, InvalidSessionError],
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
    authTokenType: AuthTokenType.RefreshToken
})

@Injectable()
export class RefreshTokenUseCase {
    constructor(private readonly userRepository: UserRepository, private readonly tokenRepository: TokenRepository) { }

    async execute(refreshToken: string): Promise<ResultValue<UserEntity, InvalidRefreshTokenError | InvalidSessionError>> {

        const verifyResult = await this.tokenRepository.verifyRefreshToken(refreshToken);
        if (verifyResult.isFail) return ResultValue.error(verifyResult.error)

        const verify = verifyResult.unwrap();
        const userId = verify.userId;
        const userResult = await this.userRepository.findByID(userId)
        if (userResult.isFail) return ResultValue.error(new InvalidRefreshTokenError())

        const userValue = userResult.unwrap();
        if (!userValue) return ResultValue.error(new InvalidRefreshTokenError())
        return ResultValue.ok(userValue);
    }
}