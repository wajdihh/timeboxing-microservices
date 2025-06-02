import { ID, ResultValue } from "@timeboxing/shared";
import { EmailValue } from "./value-objects/EmailValue";
import { InvalidEmailError } from "./errors/InvalidEmailError";

export class UserEntity {
    private constructor(
        public readonly id: ID,
        public readonly name: string,
        public readonly email: EmailValue,
        public readonly passwordHash: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(name: string, email: string, passwordHash: string): ResultValue<UserEntity, InvalidEmailError> {
        const emailResult = EmailValue.create(email);
        if (!emailResult.isOk) {
            return ResultValue.error(emailResult.error);
        }
        const user = new UserEntity(ID.generate(), name, emailResult.unwrap(), passwordHash, new Date(), new Date());
        return ResultValue.ok(user);
    }

    //For restoring from persistence (e.g. Prisma)
    static restore(props: { id: string; name: string; email: string; passwordHash: string; createdAt: Date; updatedAt: Date; }): ResultValue<UserEntity, InvalidEmailError | TypeError> {

        const idResult = ID.from(props.id);
        if (idResult.isFail) return ResultValue.error(idResult.error);

        const emailResult = EmailValue.create(props.email);
        if (emailResult.isFail) return ResultValue.error(emailResult.error);

        const user = new UserEntity(
            idResult.unwrap(),
            props.name,
            emailResult.unwrap(),
            props.passwordHash,
            props.createdAt,
            props.updatedAt
        );

        return ResultValue.ok(user);
    }
}