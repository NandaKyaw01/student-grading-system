import { z } from 'zod';
const markSchema = z
  .union([
    z
      .string()
      .min(1, 'This field is required')
      .transform((val) => parseFloat(val)),
    z.number()
  ])
  .refine((val) => !isNaN(val), { message: 'Must be a valid number' })
  .refine((val) => val >= 0, { message: 'Must be 0 or greater' })
  .refine((val) => val <= 100, { message: 'Must be 100 or less' });

const gradeSchema = z.object({
  classSubjectId: z.number(),
  examMark: markSchema,
  assignMark: markSchema
});

export const createResultSchema = z.object({
  studentId: z.number().min(1, 'Student is required'),
  academicYearId: z.number().min(1, 'Academic year is required'),
  semesterId: z.number().min(1, 'Semester is required'),
  enrollmentId: z.number().min(1, 'Enrollment is required'),
  grades: z.array(gradeSchema).min(1, 'At least one grade is required')
});

export const updateResultSchema = createResultSchema;

// Define the form data types to match what the form actually handles
export type CreateResultFormData = {
  studentId: number;
  academicYearId: number;
  semesterId: number;
  enrollmentId: number;
  grades: {
    classSubjectId: number;
    examMark: string | number; // Allow both for form handling
    assignMark: string | number; // Allow both for form handling
  }[];
};

export type UpdateResultFormData = CreateResultFormData;

// Define the processed types (after Zod transformation)
export type CreateResultData = z.infer<typeof createResultSchema>;
export type UpdateResultData = z.infer<typeof updateResultSchema>;
