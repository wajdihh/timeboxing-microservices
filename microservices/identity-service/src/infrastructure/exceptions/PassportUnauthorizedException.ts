import { UnauthorizedException } from '@nestjs/common';

export class PassportUnauthorizedException extends UnauthorizedException  {
    constructor() {
        super({
            error: 'Passport Unauthorized Exception 401',
        });
    }
}