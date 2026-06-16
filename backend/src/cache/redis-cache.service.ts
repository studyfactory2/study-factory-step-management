import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, type RedisClientType } from "redis";

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private isReady = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisUrl = this.configService.get<string>("REDIS_URL");
    if (!redisUrl) {
      return;
    }

    this.client = createClient({ url: redisUrl });
    this.client.on("error", () => {
      this.isReady = false;
    });
    this.client.on("ready", () => {
      this.isReady = true;
    });
    this.client.on("end", () => {
      this.isReady = false;
    });

    try {
      await this.client.connect();
    } catch {
      this.isReady = false;
    }
  }

  async onModuleDestroy() {
    if (!this.client || !this.isReady) {
      return;
    }

    await this.client.quit();
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isReady) {
      return null;
    }

    try {
      const cachedValue = await this.client.get(key);
      return cachedValue ? JSON.parse(cachedValue) as T : null;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.client || !this.isReady) {
      return;
    }

    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch {
      return;
    }
  }

  async delete(keys: string[]): Promise<void> {
    if (!this.client || !this.isReady || keys.length === 0) {
      return;
    }

    try {
      await this.client.del(keys);
    } catch {
      return;
    }
  }
}
