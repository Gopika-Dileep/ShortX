import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { IRedisService } from './interfaces/redis.service.interface';

@Injectable()
export class RedisService
  implements OnModuleInit, OnModuleDestroy, IRedisService {
  private client: Redis | null = null;
  private readonly logger = new Logger(RedisService.name);
  private memoryFallback = new Map<
    string,
    { value: string; expiresAt: number | null }
  >();

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    const redisUrl = this.configService.get<string>('UPSTASH_REDIS_REST_URL');
    const redisToken = this.configService.get<string>('UPSTASH_REDIS_REST_TOKEN');
    if (!redisUrl || !redisToken) {
      this.logger.warn(
        'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not configured. Falling back to In-Memory store.',
      );
      return;
    }

    try {
      this.client = new Redis({
        url: redisUrl,
        token: redisToken,
      });
      this.logger.log('Upstash Redis client initialized successfully.');
    } catch (error: any) {
      this.logger.error(
        `Upstash Redis client initialization failed: ${error.message}. Falling back to In-Memory store.`,
      );
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, value, { ex: ttlSeconds });
        } else {
          await this.client.set(key, value);
        }
        return;
      } catch (err: any) {
        this.logger.error(
          `Upstash Redis set operation failed: ${err.message}. Using fallback.`,
        );
      }
    }

    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryFallback.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        const val = await this.client.get<string>(key);
        if (val === null || val === undefined) {
          return null;
        }
        return typeof val === 'string' ? val : String(val);
      } catch (err: any) {
        this.logger.error(
          `Upstash Redis get operation failed: ${err.message}. Using fallback.`,
        );
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
        this.logger.error(
          `Upstash Redis delete operation failed: ${err.message}. Using fallback.`,
        );
      }
    }

    this.memoryFallback.delete(key);
  }

  onModuleDestroy() {

  }
}
