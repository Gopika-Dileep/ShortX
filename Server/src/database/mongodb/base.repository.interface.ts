export interface IBaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  create(item: Partial<T> | any): Promise<T>;
  update(id: string, item: Partial<T> | any): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
