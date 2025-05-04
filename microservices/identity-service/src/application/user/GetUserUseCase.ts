import { UserRepository } from "@identity/domain/user/UserRepository";
import { Injectable } from "@nestjs/common";
import { UserResponseDto } from "./dto/UserResponseDto";
import { UserNotFoundError } from "@identity/domain/user/errors/UserNotFoundError";
import { DomainHttpCode, ResultValue, SwaggerUseCaseMetadata } from "@timeboxing/shared";
import { InvalidEmailError } from "@identity/domain/user/errors/InvalidEmailError";
import { RegisterUserMapper } from "./mappers/RegisterUserMapper";

@SwaggerUseCaseMetadata({
    errors: [UserNotFoundError, InvalidEmailError],
    response: UserResponseDto,
    successStatus: DomainHttpCode.OK,
  })
@Injectable()
export class GetUserUseCase {

    constructor(private readonly userRepository: UserRepository) { }

    async execute(email: string): Promise<ResultValue<UserResponseDto, UserNotFoundError | InvalidEmailError>> {

        const userResult = await this.userRepository.findByEmail(email);
        // 1. Invalid email format
        if (!userResult.isOk) {
            return ResultValue.error(userResult.error);
        }
        const user = userResult.unwrap();
        // 2. User not found
        if (!user) {
            return ResultValue.error(new UserNotFoundError(email));
        }

        const response = RegisterUserMapper.toResponse(user);
        return ResultValue.ok(response);

    }
}