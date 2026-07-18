import { IsEmail, IsString, Length } from 'class-validator';

// Verify OTP DTO
export class VerifyOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 characters long' })
  otp: string;
}

// Resend OTP DTO
export class ResendOtpDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}

// Otp Response
export interface OtpResponse {
  message: string;
}
