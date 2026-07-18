import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { BaseMongoRepository } from '../../database/mongodb/base.mongo.repository';
import { IAuthRepository } from '../interfaces/repository/auth.repository.interface';

@Injectable()
export class AuthRepository
  extends BaseMongoRepository<UserDocument>
  implements IAuthRepository
{
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super(userModel);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }
}
