import { Model } from 'mongoose';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseMongoRepository<T> implements IBaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, unknown>): Promise<T | null> {
    return this.model.findOne(filter as unknown as Parameters<Model<T>['findOne']>[0]).exec();
  }

  async create(item: Partial<T>): Promise<T> {
    const createdItem = new this.model(item);
    return createdItem.save() as Promise<T>;
  }

  async update(id: string, item: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, item, { new: true }).exec() as Promise<T | null>;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
