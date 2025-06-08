import { Module, forwardRef } from '@nestjs/common'; // Import forwardRef
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
import { RedisIntegrationModule } from '../redis/RedisIntegrationModule';
import { UserModule } from '../user/UserModule';
import { PROMETHEUSE_METRICS_ADAPTER } from '../observability/metrics/PrometheusMetricsAdapter';

@Module({
  imports: [
    PrismaModule,
    RedisIntegrationModule,
    AppConfigModule,
        forwardRef(() => UserModule), 
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
      useFactory: (userRepository, passwordHasher, metrics) =>
        new LoginUseCase(userRepository, passwordHasher, metrics),
      inject: [USER_REPOSITORY, PASSWORD_HASHER_PORT, PROMETHEUSE_METRICS_ADAPTER],
    },
    {
      provide: RefreshTokenUseCase,
      useFactory: (userRepository, tokenRepository, metrics) =>
        new RefreshTokenUseCase(userRepository, tokenRepository, metrics),
      inject: [USER_REPOSITORY, TOKEN_REPOSITORY, PROMETHEUSE_METRICS_ADAPTER],
    },
    {
      provide: LogoutUseCase,
      useFactory: (tokenRepository, metrics) =>
        new LogoutUseCase(tokenRepository, metrics),
      inject: [TOKEN_REPOSITORY, PROMETHEUSE_METRICS_ADAPTER],
    },
  ],
  exports: [
    JwtStrategy,
    TOKEN_REPOSITORY,          
    GenerateAuthTokensService,
  ]
})
export class AuthModule {}
