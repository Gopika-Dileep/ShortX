import { z } from 'zod';

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
