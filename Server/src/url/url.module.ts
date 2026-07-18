import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Url, UrlSchema } from './schemas/url.schema';
import { UrlController } from './url.controller';
import { urlProviders } from './url.providers';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Url.name, schema: UrlSchema }]),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [UrlController],
  providers: [...urlProviders],
  exports: [...urlProviders],
})
export class UrlModule {}
