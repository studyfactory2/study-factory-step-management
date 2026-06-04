import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
    console.log(
      `PostgreSQL connected to ${
        process.env.NODE_ENV === "production" ? "production" : "development"
      } db`,
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log("PostgreSQL disconnected");
  }
}
