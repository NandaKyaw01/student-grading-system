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

// Create a function that returns the complete schema with subjects data
export const createResultSchemaWithSubjects = (
  subjects: Array<{ classSubjectId: number; assignWeight: number }>
) => {
  return z.object({
    studentId: z.number().min(1, 'Student is required'),
    academicYearId: z.number().min(1, 'Academic year is required'),
    semesterId: z.number().min(1, 'Semester is required'),
    enrollmentId: z.number().min(1, 'Enrollment is required'),
    grades: z
      .array(
        z.object({
          classSubjectId: z.number(),
          baseMark: markSchema,
          assignMark: z
            .union([
              z
                .string()
                .min(1, 'This field is required')
                .transform((val) => parseFloat(val)),
              z.number()
            ])
            .refine((val) => !isNaN(val), { message: 'Must be a valid number' })
            .refine((val) => val >= 0, { message: 'Must be 0 or greater' })
            .superRefine((val, ctx) => {
              // Find the corresponding subject for this grade
              const gradeIndex = ctx.path[1] as number;
              const subject = subjects[gradeIndex];
              if (subject && val > subject.assignWeight * 100) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: `Must be ${subject.assignWeight * 100} or less`
                });
              }
            })
        })
      )
      .min(1, 'At least one grade is required')
  });
};

// Export the type for the dynamic schema
export type CreateResultDataWithSubjects = z.infer<
  ReturnType<typeof createResultSchemaWithSubjects>
>;

// Keep the original schemas for backward compatibility
export const createResultSchema = z.object({
  studentId: z.number().min(1, 'Student is required'),
  academicYearId: z.number().min(1, 'Academic year is required'),
  semesterId: z.number().min(1, 'Semester is required'),
  enrollmentId: z.number().min(1, 'Enrollment is required'),
  grades: z
    .array(
      z.object({
        classSubjectId: z.number(),
        baseMark: markSchema,
        assignMark: markSchema // Keep original for backward compatibility
      })
    )
    .min(1, 'At least one grade is required')
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
    baseMark: string | number;
    assignMark: string | number; // Allow both for form handling
  }[];
};

export type UpdateResultFormData = CreateResultFormData;

// Define the processed types (after Zod transformation)
export type CreateResultData = z.infer<typeof createResultSchema>;
export type UpdateResultData = z.infer<typeof updateResultSchema>;
