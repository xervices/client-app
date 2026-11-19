import * as z from 'zod';

export const formSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or Phone is required.'),
  password: z.string().min(1, 'Password is required.'),
  deviceId: z.string(),
  deviceName: z.string(),
});
