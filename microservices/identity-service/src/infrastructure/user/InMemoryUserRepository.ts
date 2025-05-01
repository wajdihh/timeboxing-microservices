import { Injectable } from '@nestjs/common';
import { UserEntity } from '@identity/domain/user/UserEntity';
import { UserRepository } from '@identity/domain/user/UserRepository';
import { EmailValue } from '@identity/domain/user/value-objects/EmailValue';
import { InvalidEmailError } from '@identity/domain/user/errors/InvalidEmailError';
import { ResultValue } from '@timeboxing/shared';

@Injectable()
export class InMemoryUserRepository implements UserRepository {

    private users: UserEntity[] = [];

    async findByEmail(email: string): Promise<ResultValue<UserEntity | null, InvalidEmailError>>{
        const emailResult = EmailValue.create(email);

        if (!emailResult.isOk) {
            return ResultValue.error(emailResult.error);
        }
        
        const emailValue = emailResult.unwrap();
        const user = this.users.find(user => user.email.equals(emailValue));
        
        return ResultValue.ok(user ?? null);
    }

    
    async save(user: UserEntity):Promise<void> {
        this.users.push(user);
        return Promise.resolve();}
}