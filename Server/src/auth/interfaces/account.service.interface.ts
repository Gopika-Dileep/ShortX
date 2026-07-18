import type { VerifyOtpDto } from '../dto/verify-otp.dto';
import type { ForgotPasswordDto } from '../dto/forgot-password.dto';
import type { ResetPasswordDto } from '../dto/reset-password.dto';
import type { LoginResponse } from '../responses/login.response';

export interface IAccountService {
  sendOtp(email: string): Promise<{ message: string }>;
  verifyEmail(dto: VerifyOtpDto): Promise<LoginResponse>;
  forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }>;
}
export const IAccountServiceToken = Symbol('IAccountService');
