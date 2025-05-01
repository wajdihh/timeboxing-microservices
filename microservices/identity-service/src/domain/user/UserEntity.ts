import { ResultValue } from "@timeboxing/shared";
import { EmailValue } from "./value-objects/EmailValue";
import { InvalidEmailError } from "./errors/InvalidEmailError";

export class UserEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: EmailValue,
        public readonly passwordHash: string,
        public readonly createdAt: Date,
    ) {}

    static create(name: string, email: string, passwordHash: string ): ResultValue<UserEntity, InvalidEmailError> {
        const emailResult = EmailValue.create(email);
        if (!emailResult.isOk) {
            ResultValue.error(emailResult.error);
        }
        const user = new UserEntity(crypto.randomUUID(), name, emailResult.unwrap(), passwordHash, new Date());
        return ResultValue.ok(user);
    }
}