import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);
  private memoryFallback = new Map<string, { value: string; expiresAt: number | null }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const redisUri = this.configService.get<string>('redis.uri');
    if (!redisUri) {
      this.logger.warn('redis.uri is not configured. Falling back to In-Memory store.');
      return;
    }

    try {
      this.client = new Redis(redisUri, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
      });

      this.client.on('error', (err) => {
        this.logger.error(`Redis connection error: ${err.message}. Falling back to In-Memory store.`);
        this.client = null;
      });

      this.client.connect().catch((err) => {
        this.logger.error(`Failed to connect to Redis: ${err.message}. Falling back to In-Memory store.`);
        this.client = null;
      });
    } catch (error: any) {
      this.logger.error(`Redis client initialization failed: ${error.message}. Falling back to In-Memory store.`);
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err: any) {
        this.logger.error(`Redis set operation failed: ${err.message}. Using fallback.`);
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryFallback.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        return await this.client.get(key);
      } catch (err: any) {
        this.logger.error(`Redis get operation failed: ${err.message}. Using fallback.`);
      }
    }

    const item = this.memoryFallback.get(key);
    if (!item) return null;

    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.memoryFallback.delete(key);
      return null;
    }

    return item.value;
  }

  async delete(key: string): Promise<void> {
    if (this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (err: any) {
        this.logger.error(`Redis delete operation failed: ${err.message}. Using fallback.`);
      }
    }

    this.memoryFallback.delete(key);
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }
}
