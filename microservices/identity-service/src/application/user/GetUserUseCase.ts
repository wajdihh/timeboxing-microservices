import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { UserResponseDto } from "./dto/UserResponseDto";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { SuccessStatus, ID, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { UserMapper } from "./dto/UserMapper";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError],
    response: UserResponseDto,
    successStatus: SuccessStatus.OK,
})
@Injectable()
export class GetUserUseCase {

    constructor(private readonly userRepository: UserRepository) { }

    async execute(id: string): Promise<ResultValue<UserResponseDto, UserNotFoundError>> {
        const userResult = await this.userRepository.findByID(ID.from(id));
        const userValue = userResult.unwrap();

        if (!userValue) return ResultValue.error(new UserNotFoundError(id));

        const response = UserMapper.toResponse(userValue);
        return ResultValue.ok(response);

    }
}