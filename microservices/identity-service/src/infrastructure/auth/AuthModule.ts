import { Module } from '@nestjs/common';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from './tools/BcryptPasswordAdapter';
import { TokenServiceAdapter } from './TokenServiceAdapter';
import { AuthController } from './AuthController';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { PrismaUserRepository } from '../user/PrismaUserRepository';
import { TOKEN_SERVICE } from '@identity/domain/auth/TokenService';
import { USER_REPOSITORY } from '@identity/domain/user/UserRepository';
import { PrismaModule } from '../prisma/PrismaModule';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [
    { provide: TOKEN_SERVICE, useClass: TokenServiceAdapter },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },

    {
      provide: LoginUseCase,
      useFactory: (userRepository, tokenService, passwordHasher) => 
        new LoginUseCase(userRepository, tokenService, passwordHasher),
      inject: [USER_REPOSITORY, TOKEN_SERVICE, PASSWORD_HASHER_PORT],
    },
  ],
})
export class AuthModule { }
