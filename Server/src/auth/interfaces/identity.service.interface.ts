import type { RegisterDto } from '../dto/register.dto';
import type { LoginDto } from '../dto/login.dto';
import type { LoginResponse } from '../responses/login.response';
import type { TokenResponse } from '../responses/token.response';
import type { RegisterResponse } from '../responses/register.response';

export interface IIdentityService {
  register(dto: RegisterDto): Promise<RegisterResponse>;
  login(dto: LoginDto): Promise<LoginResponse>;
  logout(userId: string): Promise<{ message: string }>;
  refreshTokens(refreshToken: string): Promise<TokenResponse>;
}
export const IIdentityServiceToken = Symbol('IIdentityService');
