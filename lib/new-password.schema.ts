import * as z from 'zod';
import { emojiRegex } from '@/lib/utils';

export const formSchema = z
  .object({
    code: z.string().min(1, 'OTP is required.'),
    newPassword: z
      .string()
      .min(1, 'Password is required.')
      .refine((val) => !/\s/.test(val), 'Password cannot contain spaces.')
      .refine((val) => !emojiRegex.test(val), 'Password cannot contain emojis.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
