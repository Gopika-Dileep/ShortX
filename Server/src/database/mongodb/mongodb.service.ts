import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { IMongodbService } from './interfaces/mongodb.service.interface';

@Injectable()
export class MongodbService implements IMongodbService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getConnection(): Connection {
    return this.connection;
  }
}
