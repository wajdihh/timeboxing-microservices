import { Module } from '@nestjs/common';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from './tools/BcryptPasswordAdapter';
import { AuthRepositoryAdapter } from './AuthRepositoryAdapter';
import { AuthController } from './AuthController';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { PrismaUserRepository } from '../user/PrismaUserRepository';
import { AUTH_REPOSITORY } from '@identity/domain/auth/AuthRepository';
import { USER_REPOSITORY } from '@identity/domain/user/UserRepository';
import { PrismaModule } from '../prisma/PrismaModule';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';

@Module({
  imports: [
    PrismaModule
  ],
  controllers: [AuthController],
  providers: [
    { provide: AUTH_REPOSITORY, useClass: AuthRepositoryAdapter },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },
    {
      provide: LoginUseCase,
      useFactory: (userRepository, authRepository, passwordHasher) =>
        new LoginUseCase(userRepository, authRepository, passwordHasher),
      inject: [USER_REPOSITORY, AUTH_REPOSITORY, PASSWORD_HASHER_PORT],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepository, authRepository) =>
        new RefreshTokenUseCase(userRepository, authRepository),
      inject: [USER_REPOSITORY, AUTH_REPOSITORY],
    }
  ],
})
export class AuthModule { }
