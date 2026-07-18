import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongodbService } from './mongodb.service';
import { IMongodbService } from './interfaces/mongodb.service.interface';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
  ],
  providers: [
    {
      provide: IMongodbService,
      useClass: MongodbService,
    },
  ],
  exports: [MongooseModule, IMongodbService],
})
export class MongodbModule {}
