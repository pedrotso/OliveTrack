import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      // The API can start without the database so /api/health can respond. Database requests fail individually.
      this.logger.error(`Sem ligação ao PostgreSQL: ${(e as Error).message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
