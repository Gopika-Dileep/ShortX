import type { UserDocument } from '../schemas/user.schema';
import type { IBaseRepository } from '../../database/mongodb/base.repository.interface';

export interface IAuthRepository extends IBaseRepository<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}
export const IAuthRepositoryToken = Symbol('IAuthRepository');
