import { Connection } from 'mongoose';

export interface IMongodbService {
  getConnection(): Connection;
}

export const IMongodbService = Symbol('IMongodbService');
