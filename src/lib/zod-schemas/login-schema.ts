import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Invalid email'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(5, 'Password must be more than 5 characters')
    .max(32, 'Password must be less than 32 characters')
});

export type LoginFormInput = z.infer<typeof loginSchema>;
