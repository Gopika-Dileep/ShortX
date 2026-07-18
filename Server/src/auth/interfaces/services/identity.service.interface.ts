import type {
  RegisterDto,
  LoginDto,
  RegisterResponse,
  LoginResponse,
  TokenResponse,
} from '../../dto/auth.dto';

export interface IIdentityService {
  register(dto: RegisterDto): Promise<RegisterResponse>;
  login(dto: LoginDto): Promise<LoginResponse>;
  logout(userId: string): Promise<{ message: string }>;
  refreshTokens(refreshToken: string): Promise<TokenResponse>;
}
export const IIdentityService = Symbol('IIdentityService');
