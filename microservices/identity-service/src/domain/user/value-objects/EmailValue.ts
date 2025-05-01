import { InvalidEmailError } from "../errors/InvalidEmailError";
import { ResultValue } from "@timeboxing/shared";

export class EmailValue {
    public readonly value: string;

    private constructor(email: string) {
        this.value = email.toLowerCase();
    }

    static create(email: string): ResultValue<EmailValue, InvalidEmailError> {
        if (!this.isValidEmail(email)) {
            return ResultValue.error(new InvalidEmailError(email));
        }
        return ResultValue.ok(new EmailValue(email));
    }

    equals(other: EmailValue): boolean {
        return this.value === other.value;
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
