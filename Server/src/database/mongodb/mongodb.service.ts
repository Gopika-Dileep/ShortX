import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getConnection(): Connection {
    return this.connection;
  }
}
