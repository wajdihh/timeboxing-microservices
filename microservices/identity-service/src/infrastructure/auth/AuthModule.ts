import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/PrismaModule';
import { PrismaUserRepository } from '../user/PrismaUserRepository';
import { AuthController } from './AuthController';
import { LocalStrategy } from './strategies/LocalStrategy';
import { TokenRepositoryAdapter } from './TokenRepositoryAdapter';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from './tools/BcryptPasswordAdapter';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { USER_REPOSITORY } from '@identity/domain/user/UserRepository';
import { TOKEN_REPOSITORY } from '@identity/domain/auth/TokenRepository';
import { JwtOptionsFactory } from 'src/config/JwtOptionsFactory';
import { JwtConfigService } from 'src/config/JwtConfigService';
import { AppConfigModule } from 'src/config/AppConfigModule';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [JwtConfigService], 
      useFactory: JwtOptionsFactory,
    }),
  ],
  controllers: [AuthController],
  providers: [
    LocalStrategy,
    TokenRepositoryAdapter,
    { provide: TOKEN_REPOSITORY, useExisting: TokenRepositoryAdapter },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },
    {
      provide: GenerateAuthTokensService,
      useFactory: (tokenRepository) => 
        new GenerateAuthTokensService(tokenRepository),
      inject: [TOKEN_REPOSITORY],
    },
    {
      provide: LoginUseCase,
      useFactory: (userRepository, passwordHasher) =>
        new LoginUseCase(userRepository, passwordHasher),
      inject: [USER_REPOSITORY, PASSWORD_HASHER_PORT],
    },
  ],
  exports: [
    TOKEN_REPOSITORY,          
    GenerateAuthTokensService,
  ]
})
export class AuthModule {}
