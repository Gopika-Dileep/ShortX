import { Injectable } from '@nestjs/common';
import type { UserDocument } from '../schemas/user.schema';

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class AuthMapper {
  static toResponse(user: UserDocument): UserResponse {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
