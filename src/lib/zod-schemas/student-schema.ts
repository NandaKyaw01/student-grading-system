import { z } from 'zod';

export const createStudentSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  rollNumber: z.string().min(1, { message: 'Roll number is required' })
});

export const updateStudentSchema = z.object({
  id: z.number().min(1, { message: 'ID is required' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  rollNumber: z.string().min(1, { message: 'Roll number is required' })
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
