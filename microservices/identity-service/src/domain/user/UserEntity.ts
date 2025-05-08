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
            ResultValue.error(emailResult.error);
        }
        const user = new UserEntity(ID.generate(), name, emailResult.unwrap(), passwordHash, new Date(), new Date());
        return ResultValue.ok(user);
    }

    //For restoring from persistence (e.g. Prisma)
    static restore(props: { id: string; name: string; email: string; passwordHash: string; createdAt: Date; updatedAt: Date; }):  ResultValue<UserEntity, TypeError> {

        const idResult = ID.from(props.id);
        if (idResult.isFail) return ResultValue.error(idResult.error);
        const idValue = idResult.unwrap();

        const user = new UserEntity(
            idValue,
            props.name,
            EmailValue.create(props.email).unwrap(),
            props.passwordHash,
            props.createdAt,
            props.updatedAt
        );

        return ResultValue.ok(user);
    }
}