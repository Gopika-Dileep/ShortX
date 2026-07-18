import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IUrlService } from '../interfaces/services/url.service.interface';
import { IUrlRepository } from '../interfaces/repository/url.repository.interface';
import { IRedisService } from '../../database/redis/interfaces/redis.service.interface';
import { UrlDocument } from '../schemas/url.schema';
import { Types } from 'mongoose';

@Injectable()
export class UrlService implements IUrlService {
  constructor(
    @Inject(IUrlRepository)
    private readonly urlRepository: IUrlRepository,
    @Inject(IRedisService)
    private readonly redisService: IRedisService,
  ) {}

  async shortenUrl(
    userId: string,
    originalUrl: string,
    customCode?: string,
  ): Promise<UrlDocument> {
    let shortCode = customCode;

    if (shortCode) {
      const existing = await this.urlRepository.findByShortCode(shortCode);
      if (existing) {
        throw new ConflictException('Custom short code is already in use');
      }
    } else {
      let attempts = 0;
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      while (attempts < 5) {
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const existing = await this.urlRepository.findByShortCode(code);
        if (!existing) {
          shortCode = code;
          break;
        }
        attempts++;
      }
      if (!shortCode) {
        throw new Error('Failed to generate a unique short code');
      }
    }

    const urlObj = await this.urlRepository.create({
      originalUrl,
      shortCode,
      user: new Types.ObjectId(userId),
      clicks: 0,
    });

    // Cache it in Redis
    await this.redisService.set(`url:${shortCode}`, originalUrl, 86400); // 24 hours TTL

    return urlObj;
  }

  async resolveUrl(shortCode: string): Promise<string> {
    // Check Redis cache first
    const cached = await this.redisService.get(`url:${shortCode}`);
    if (cached) {
      // Increment clicks asynchronously
      this.urlRepository.findByShortCode(shortCode).then((urlDoc) => {
        if (urlDoc) {
          this.urlRepository.incrementClicks(urlDoc._id.toString());
        }
      }).catch(() => {});
      return cached;
    }

    // DB fallback
    const urlDoc = await this.urlRepository.findByShortCode(shortCode);
    if (!urlDoc) {
      throw new NotFoundException('Shortened URL not found');
    }

    // Set cache
    await this.redisService.set(`url:${shortCode}`, urlDoc.originalUrl, 86400);

    // Increment clicks
    await this.urlRepository.incrementClicks(urlDoc._id.toString());

    return urlDoc.originalUrl;
  }

  async getUserUrls(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: UrlDocument[]; total: number; totalClicks: number; activeDomains: number }> {
    const paginated = await this.urlRepository.findByUserPaginated(userId, page, limit, search);
    const allUrls = await this.urlRepository.findByUser(userId);
    
    const totalClicks = allUrls.reduce((sum, item) => sum + item.clicks, 0);
    const activeDomains = new Set(
      allUrls
        .map((item) => {
          try {
            return new URL(item.originalUrl).hostname;
          } catch {
            return null;
          }
        })
        .filter(Boolean),
    ).size;

    return {
      data: paginated.data,
      total: paginated.total,
      totalClicks,
      activeDomains,
    };
  }

  async deleteUrl(userId: string, id: string): Promise<boolean> {
    const urlDoc = await this.urlRepository.findById(id);
    if (!urlDoc) {
      throw new NotFoundException('Shortened URL not found');
    }

    if (urlDoc.user.toString() !== userId) {
      throw new ConflictException('You do not have permission to delete this URL');
    }

    const deleted = await this.urlRepository.delete(id);
    if (deleted) {
      await this.redisService.delete(`url:${urlDoc.shortCode}`);
    }
    return deleted;
  }
}
