import * as z from 'zod';

export const formSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email/Phone number is required.'),
});
