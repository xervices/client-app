import * as z from 'zod';
import { emojiRegex } from '@/lib/utils';

export const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Your fullname is required.')
      .refine((val) => !emojiRegex.test(val), 'Name cannot contain emojis.'),
    phoneNumber: z.string(),
    email: z
      .email('Invalid email address')
      .min(1, 'Email is required.'),
    password: z
      .string()
      .min(1, 'Password is required.')
      .refine((val) => !/\s/.test(val), 'Password cannot contain spaces.')
      .refine((val) => !emojiRegex.test(val), 'Password cannot contain emojis.'),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
    role: z.union([z.literal('user')]),
    referralCode: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
