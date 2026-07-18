import { z } from 'zod';

export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type ResendOtpDto = z.infer<typeof ResendOtpSchema>;
