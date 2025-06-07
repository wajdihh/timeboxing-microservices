import { UserRepository } from "@identity/domain/user/UserRepository";
import { TokenRepository } from "@identity/domain/auth/TokenRepository";
import { Injectable } from "@nestjs/common";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { AuthTokenType, ID, ResultValue, SuccessStatus, SwaggerUseCaseMetadata } from "@timeboxing/shared";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError],
    successStatus: SuccessStatus.NO_CONTENT,
    authTokenType: AuthTokenType.AccessToken,
})
@Injectable()
export class DeleteUserUseCase {
    constructor(private readonly userRepository: UserRepository,
                private readonly tokenRepository: TokenRepository) {}

    async execute(id: string): Promise<ResultValue<void, UserNotFoundError>> {
        const idResult = ID.from(id);
        if (idResult.isFail) return ResultValue.error(idResult.error);
        const idValue = idResult.unwrap();

        const userResult = await this.userRepository.findByID(idValue);
        if (userResult.isFail) return ResultValue.error(userResult.error);
        const user = userResult.unwrap();
        if (!user) return ResultValue.error(new UserNotFoundError(id));

        await this.userRepository.delete(idValue);
        await this.tokenRepository.revokeAllRefreshToken(id);
        return ResultValue.ok();
    }
}
