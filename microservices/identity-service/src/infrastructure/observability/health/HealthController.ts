import { Controller, Get, HttpCode, HttpStatus, Logger, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/PrismaService';
import { RedisService } from '../../redis/RedisService';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

interface DependencyStatusDetail {
  status: 'ok' | 'error';
  error?: string;
}

interface ReadinessDependencies {
  database: DependencyStatusDetail;
  redis: DependencyStatusDetail;
}

interface ReadinessResponsePayload {
  status: 'ready' | 'not_ready';
  dependencies: ReadinessDependencies;
}

@ApiTags('Health Checks')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness probe: Check if the service is running' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Service is alive.', schema: { example: { status: 'ok' } } })
  @HttpCode(HttpStatus.OK)
  checkLiveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe: Check if the service and its dependencies are ready' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Service and dependencies are ready.', 
    schema: { 
      example: { 
        status: 'ready', 
        dependencies: { database: { status: 'ok' }, redis: { status: 'ok' } } 
      } as ReadinessResponsePayload
    } 
  })
  @ApiResponse({ 
    status: HttpStatus.SERVICE_UNAVAILABLE, 
    description: 'Service or one of its dependencies is not ready.',
    schema: {
      example: {
        status: 'not_ready',
        dependencies: { database: { status: 'error', error: 'Connection failed' }, redis: { status: 'ok' } }
      } as ReadinessResponsePayload
    }
  })
  async checkReadiness(): Promise<ReadinessResponsePayload> {
    const dependencyResults: ReadinessDependencies = {
      database: { status: 'ok' }, // Assume ok initially
      redis: { status: 'ok' },    // Assume ok initially
    };

    let overallReady = true;

    // Check Database
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      dependencyResults.database.status = 'ok';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Database readiness check failed:', errorMessage);
      dependencyResults.database.status = 'error';
      dependencyResults.database.error = errorMessage;
      overallReady = false;
    }

    // Check Redis
    try {
      const pong = await this.redisService.ping();
      if (pong === 'PONG') {
        dependencyResults.redis.status = 'ok';
      } else {
        const errorMessage = `Expected PONG, got ${pong}`;
        this.logger.error(`Redis readiness check failed: ${errorMessage}`);
        dependencyResults.redis.status = 'error';
        dependencyResults.redis.error = errorMessage;
        overallReady = false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Redis readiness check failed:', errorMessage);
      dependencyResults.redis.status = 'error';
      dependencyResults.redis.error = errorMessage;
      overallReady = false;
    }

    const responsePayload: ReadinessResponsePayload = {
      status: overallReady ? 'ready' : 'not_ready',
      dependencies: dependencyResults,
    };

    if (overallReady) {
      // @HttpCode(HttpStatus.OK) will be applied by default if no exception is thrown
      return responsePayload;
    } else {
      // Throwing ServiceUnavailableException will correctly set the 503 status code
      // and the GlobalExceptionFilter will handle formatting the response.
      // We pass the detailed payload to the exception.
      throw new ServiceUnavailableException(responsePayload);
    }
  }
}
