import type { VerifyOtpDto } from '../../dto/otp.dto';
import type {
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../../dto/password.dto';
import type { LoginResponse } from '../../dto/auth.dto';

export interface IAccountService {
  sendOtp(email: string): Promise<{ message: string }>;
  verifyEmail(dto: VerifyOtpDto): Promise<LoginResponse>;
  forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }>;
}
export const IAccountService = Symbol('IAccountService');
