import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './LoggerService';
import { GlobalExceptionFilter } from '../errors/GlobalExceptionFilter'; // Restore import
export const LOGGER_SERVICE_NAME_TOKEN = 'LOGGER_SERVICE_NAME';

export interface LoggerModuleOptions {
  serviceName?: string; // Optional: if not provided, LoggerService will use ConfigService or a default
}

@Global() // Makes LoggerService available globally once LoggerModule is imported in AppModule
@Module({})
export class LoggerModule {
  static forRoot(options?: LoggerModuleOptions): DynamicModule {
    const serviceNameProvider: Provider = {
      provide: LOGGER_SERVICE_NAME_TOKEN,
      useValue: options?.serviceName || null, // Use null if not provided, LoggerService will handle fallback
    };

    // This provider allows LoggerService to be created with specific serviceName or fallback to ConfigService
    const loggerServiceProvider: Provider = {
      provide: LoggerService,
      useFactory: (configService: ConfigService, serviceNameTokenValue: string | null) => {
        // Priority: 1. Direct serviceName from forRoot, 2. SERVICE_NAME from ConfigService, 3. 'unknown-service'
        const serviceName = serviceNameTokenValue || configService.get<string>('SERVICE_NAME') || 'unknown-service';
        
        // Create a temporary ConfigService-like object if actual ConfigService is not available or for overriding
        const effectiveConfig = {
          get: (key: string) => {
            if (key === 'SERVICE_NAME') return serviceName;
            if (key === 'LOG_LEVEL') return configService.get<string>('LOG_LEVEL') || 'info';
            return undefined;
          }
        } as ConfigService; // Cast to ConfigService type for compatibility with LoggerService constructor

        return new LoggerService(effectiveConfig);
      },
      inject: [ConfigService, LOGGER_SERVICE_NAME_TOKEN],
    };
    
    return {
      module: LoggerModule,
      providers: [serviceNameProvider, loggerServiceProvider, GlobalExceptionFilter], // Restore GlobalExceptionFilter
      exports: [LoggerService, GlobalExceptionFilter], // Restore GlobalExceptionFilter
    };
  }

  // A simpler version if you always want to rely on ConfigService for SERVICE_NAME and LOG_LEVEL
  // And don't need to pass serviceName directly via forRoot
  static forRootAsync(): DynamicModule {
    const loggerServiceProvider: Provider = {
        provide: LoggerService,
        useFactory: (configService: ConfigService) => {
            return new LoggerService(configService);
        },
        inject: [ConfigService],
    };
    return {
        module: LoggerModule,
        providers: [loggerServiceProvider, GlobalExceptionFilter], // Restore GlobalExceptionFilter
        exports: [LoggerService, GlobalExceptionFilter], // Restore GlobalExceptionFilter
    };
  }
}
