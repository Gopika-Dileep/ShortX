import { UrlDocument } from '../../schemas/url.schema';

export interface IUrlService {
  shortenUrl(
    userId: string,
    originalUrl: string,
    customCode?: string,
  ): Promise<UrlDocument>;
  resolveUrl(shortCode: string): Promise<string>;
  getUserUrls(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<{ data: UrlDocument[]; total: number; totalClicks: number; activeDomains: number }>;
  deleteUrl(userId: string, id: string): Promise<boolean>;
}

export const IUrlService = Symbol('IUrlService');
