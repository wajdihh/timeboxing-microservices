import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/PrismaModule';
import { PrismaUserRepository } from '../user/PrismaUserRepository';
import { AuthController } from './AuthController';
import { LocalStrategy } from './strategies/LocalStrategy';
import { JwtStrategy } from './strategies/JwtStrategy';
import { TokenRepositoryAdapter } from './TokenRepositoryAdapter';
import { BcryptPasswordAdapter, PASSWORD_HASHER_PORT } from './tools/BcryptPasswordAdapter';
import { LoginUseCase } from '@identity/application/auth/LoginUseCase';
import { USER_REPOSITORY, UserRepository } from '@identity/domain/user/UserRepository';
import { TOKEN_REPOSITORY } from '@identity/domain/auth/TokenRepository';
import { JwtOptionsFactory } from '@identity/config/JwtOptionsFactory';
import { AppConfigModule } from '@identity/config/AppConfigModule';
import { GenerateAuthTokensService } from '@identity/application/user/GenerateAuthTokensService';
import { JwtConfigService } from '@identity/config/JwtConfigService';
import { RefreshStrategy } from './strategies/RefreshStrategy';
import { RefreshTokenUseCase } from '@identity/application/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '@identity/application/auth/LogoutUseCase';

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
    RefreshStrategy,
    TokenRepositoryAdapter,
    { provide: TOKEN_REPOSITORY, useExisting: TokenRepositoryAdapter },
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: PASSWORD_HASHER_PORT, useClass: BcryptPasswordAdapter },
    {
      provide: JwtStrategy,
      useFactory: (jwtConfig: JwtConfigService, userRepository: UserRepository) =>
        new JwtStrategy(jwtConfig, userRepository),
      inject: [JwtConfigService, USER_REPOSITORY],
    },
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
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepository, tokenRepository) =>
        new RefreshTokenUseCase(userRepository, tokenRepository),
      inject: [USER_REPOSITORY, TOKEN_REPOSITORY],
    },
    {
      provide: LogoutUseCase,
      useFactory: (tokenRepository) =>
        new LogoutUseCase(tokenRepository),
      inject: [TOKEN_REPOSITORY],
    },
  ],
  exports: [
    JwtStrategy,
    TOKEN_REPOSITORY,          
    GenerateAuthTokensService,
  ]
})
export class AuthModule {}
