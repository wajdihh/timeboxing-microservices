import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { AuthTokenType, ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { TokenRepository } from "@identity/domain/auth/TokenRepository";
import { InvalidRefreshTokenError } from "@identity/domain/auth/erros/InvalidRefreshTokenError";
import { UserEntity } from "@identity/domain/user/UserEntity";

@SwaggerUseCaseMetadata({
    errors: [InvalidRefreshTokenError],
    response: AuthResponseDto,
    successStatus: SuccessStatus.CREATED,
    authTokenType: AuthTokenType.AccessToken
})

@Injectable()
export class RefreshTokenUseCase {
    constructor(private readonly userRepository: UserRepository, private readonly tokenRepository: TokenRepository) { }

    async execute(refreshToken: string): Promise<ResultValue<UserEntity, InvalidRefreshTokenError>> {

        const idResult = await this.tokenRepository.verifyRefreshToken(refreshToken);
        if (idResult.isFail) return ResultValue.error(new InvalidRefreshTokenError())

        const id = idResult.unwrap();
        const userResult = await this.userRepository.findByID(id)
        if (userResult.isFail) return ResultValue.error(new InvalidRefreshTokenError())

        const userValue = userResult.unwrap();
        if (!userValue) return ResultValue.error(new InvalidRefreshTokenError())
        return ResultValue.ok(userValue);
    }
}