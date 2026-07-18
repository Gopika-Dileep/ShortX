import { Module } from '@nestjs/common';
import { MongodbModule } from './mongodb/mongodb.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [MongodbModule, RedisModule],
  exports: [MongodbModule, RedisModule],
})
export class DatabaseModule {}
