import { PasswordHasherPort } from '@identity/application/security/PasswordHasherPort';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPasswordAdapter implements PasswordHasherPort {
    async hash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
  
    async compare(plain: string, hashed: string): Promise<boolean> {
        return await bcrypt.compare(plain, hashed);
    }
  }