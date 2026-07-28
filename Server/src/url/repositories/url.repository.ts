import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Url, UrlDocument } from '../schemas/url.schema';
import { BaseMongoRepository } from '../../database/mongodb/base.mongo.repository';
import { IUrlRepository } from '../interfaces/repository/url.repository.interface';

@Injectable()
export class UrlRepository
  extends BaseMongoRepository<UrlDocument>
  implements IUrlRepository
{
  constructor(
    @InjectModel(Url.name)
    private readonly urlModel: Model<UrlDocument>,
  ) {
    super(urlModel);
  }

  async findByShortCode(shortCode: string): Promise<UrlDocument | null> {
    return this.urlModel.findOne({ shortCode }).exec();
  }

  async findByUser(userId: string): Promise<UrlDocument[]> {
    return this.urlModel.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findByUserPaginated(
    userId: string,
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ data: UrlDocument[]; total: number }> {
    const query: Record<string, any> = { user: new Types.ObjectId(userId) };

    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.urlModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.urlModel.countDocuments(query).exec(),
    ]);

    return { data, total };
  }

  async incrementClicks(id: string): Promise<UrlDocument | null> {
    return this.urlModel.findByIdAndUpdate(
      id,
      { $inc: { clicks: 1 } },
      { new: true },
    ).exec();
  }
}
