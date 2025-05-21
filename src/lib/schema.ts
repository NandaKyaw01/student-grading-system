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

export const studentFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  rollNumber: z.string().min(1, { message: 'Roll number is required' }),
  classId: z.string().min(1, { message: 'Class is required' }),
  academicYearId: z.string().min(1, { message: 'Academic year is required' })
});
