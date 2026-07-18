import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Inject,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IUrlService } from './interfaces/services/url.service.interface';
import { ShortenUrlDto } from './dto/shorten-url.dto';
import { UrlPaginationDto } from './dto/url-pagination.dto';

@Controller('url')
export class UrlController {
  constructor(
    @Inject(IUrlService)
    private readonly urlService: IUrlService,
  ) {}

  @Post('shorten')
  @UseGuards(JwtAuthGuard)
  async shorten(@Req() req: any, @Body() shortenUrlDto: ShortenUrlDto) {
    const userId = req.user.userId || req.user._id;
    return this.urlService.shortenUrl(
      userId,
      shortenUrlDto.originalUrl,
      shortenUrlDto.customCode,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyUrls(
    @Req() req: any,
    @Query() query: UrlPaginationDto,
  ) {
    const userId = req.user.userId || req.user._id;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search;

    const result = await this.urlService.getUserUrls(userId, page, limit, search);
    return {
      data: result.data,
      total: result.total,
      totalClicks: result.totalClicks,
      activeDomains: result.activeDomains,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteUrl(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId || req.user._id;
    await this.urlService.deleteUrl(userId, id);
    return { message: 'Shortened URL deleted successfully' };
  }

  @Get(':shortCode')
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() res: Response,
  ) {
    const originalUrl = await this.urlService.resolveUrl(shortCode);
    return res.redirect(HttpStatus.FOUND, originalUrl);
  }
}
