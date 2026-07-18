import { z } from 'zod';

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters long'),
});

export type VerifyOtpDto = z.infer<typeof VerifyOtpSchema>;
