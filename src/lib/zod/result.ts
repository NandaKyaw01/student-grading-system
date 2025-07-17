import { useTranslations } from 'next-intl';
import { z } from 'zod';

type markKeys = ReturnType<
  typeof useTranslations<'ResultsBySemester.ResultForm'>
>;
const markSchema = (t: markKeys) =>
  z
    .union([
      z
        .string()
        .min(1, t('zod.required'))
        .transform((val) => parseFloat(val)),
      z.number()
    ])
    .refine((val) => !isNaN(val), { message: t('zod.number') })
    .refine((val) => val >= 0, { message: t('zod.min') })
    .refine((val) => val <= 100, { message: t('zod.max') });

const markSchemaForAction = z
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

export const createResultSchemaWithSubjects = (
  subjects: Array<{ classSubjectId: number; assignWeight: number }>,
  t: markKeys
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
          baseMark: markSchema(t),
          assignMark: z
            .union([
              z
                .string()
                .min(1, t('zod.required'))
                .transform((val) => parseFloat(val)),
              z.number()
            ])
            .refine((val) => !isNaN(val), { message: t('zod.number') })
            .refine((val) => val >= 0, { message: t('zod.min') })
            .superRefine((val, ctx) => {
              // Find the corresponding subject for this grade
              const gradeIndex = ctx.path[1] as number;
              const subject = subjects[gradeIndex];
              if (subject && val > subject.assignWeight * 100) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('zod.custom_max', {
                    max: subject.assignWeight * 100
                  })
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
export const createResultSchema = (t: markKeys) =>
  z.object({
    studentId: z.number().min(1, t('zod.student_required')),
    academicYearId: z.number().min(1, t('zod.academic_year_required')),
    semesterId: z.number().min(1, t('zod.semester_required')),
    enrollmentId: z.number().min(1, t('zod.enrollment_required')),
    grades: z
      .array(
        z.object({
          classSubjectId: z.number(),
          baseMark: markSchema(t),
          assignMark: markSchema(t) // Keep original for backward compatibility
        })
      )
      .min(1, t('zod.at_least_one_grade'))
  });

export const updateResultSchema = createResultSchema;

export const createResultSchemaForAction = z.object({
  studentId: z.number().min(1, 'Student is required'),
  academicYearId: z.number().min(1, 'Academic year is required'),
  semesterId: z.number().min(1, 'Semester is required'),
  enrollmentId: z.number().min(1, 'Enrollment is required'),
  grades: z
    .array(
      z.object({
        classSubjectId: z.number(),
        baseMark: markSchemaForAction,
        assignMark: markSchemaForAction // Keep original for backward compatibility
      })
    )
    .min(1, 'At least one grade is required')
});

export const updateResultSchemaForAction = createResultSchemaForAction;

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
export type CreateResultData = z.infer<ReturnType<typeof createResultSchema>>;
export type UpdateResultData = z.infer<ReturnType<typeof updateResultSchema>>;
