import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('[PrismaService] Connected to database successfully.');
    } catch (error) {
      console.error('[PrismaService] Failed to connect to the database on module init:', error);
      throw error; // Re-throw to ensure NestJS knows about the failure
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
