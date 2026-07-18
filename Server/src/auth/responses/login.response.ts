import type { UserResponse } from '../mapper/auth.mapper';

export interface LoginResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}
