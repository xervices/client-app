import * as z from 'zod';

export const formSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'Email or Phone is required.')
    .refine(
      (val) => {
        const isEmail = val.includes('@');
        return isEmail ? val === val.toLowerCase() : true;
      },
      { message: 'Email must be lowercase.' }
    ),
  password: z.string().min(1, 'Password is required.'),
  deviceId: z.string(),
  deviceName: z.string(),
});
