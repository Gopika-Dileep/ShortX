import { Model } from 'mongoose';
import { IBaseRepository } from './base.repository.interface';

export abstract class BaseMongoRepository<T> implements IBaseRepository<T> {
  protected constructor(protected readonly model: Model<any>) {}

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async create(item: Partial<T> | any): Promise<T> {
    const createdItem = new this.model(item);
    return createdItem.save();
  }

  async update(id: string, item: Partial<T> | any): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, item, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }
}
