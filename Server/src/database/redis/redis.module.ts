import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { IRedisService } from './interfaces/redis.service.interface';

@Module({
  providers: [
    {
      provide: IRedisService,
      useClass: RedisService,
    },
  ],
  exports: [IRedisService],
})
export class RedisModule {}
