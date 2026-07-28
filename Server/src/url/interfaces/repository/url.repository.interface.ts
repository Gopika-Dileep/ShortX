import { IBaseRepository } from '../../../database/mongodb/base.repository.interface';
import { UrlDocument } from '../../schemas/url.schema';

export interface IUrlRepository extends IBaseRepository<UrlDocument> {
  findByShortCode(shortCode: string): Promise<UrlDocument | null>;
  findByUser(userId: string): Promise<UrlDocument[]>;
  findByUserPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: UrlDocument[]; total: number }>;
  incrementClicks(id: string): Promise<UrlDocument | null>;
}

export const IUrlRepository = Symbol('IUrlRepository');
