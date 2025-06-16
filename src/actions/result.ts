'use server';

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import { revalidateTag, unstable_cache } from 'next/cache';

import { Prisma, Result } from '@/generated/prisma';
import { GetResultSchema } from '@/lib/search-params/result';
import { z } from 'zod';
import {
  CreateResultFormData,
  createResultSchema,
  UpdateResultFormData,
  updateResultSchema
} from '@/lib/zod/result';

const resultWithDetails = Prisma.validator<Prisma.ResultInclude>()({
  enrollment: {
    include: {
      student: true,
      class: true,
      semester: {
        include: {
          academicYear: true
        }
      }
    }
  }
});

export type ResultWithDetails = Prisma.ResultGetPayload<{
  include: typeof resultWithDetails;
}>;

export async function deleteResult(enrollmentId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      // First delete grades
      await tx.grade.deleteMany({
        where: { enrollmentId }
      });

      // Then delete the result
      await tx.result.delete({
        where: { enrollmentId }
      });
    });

    revalidateTag('results');
    revalidateTag(`result-${enrollmentId}`);

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function deleteResults(enrollmentIds: number[]) {
  try {
    await prisma.$transaction(async (tx) => {
      // First delete grades
      await tx.grade.deleteMany({
        where: {
          enrollmentId: {
            in: enrollmentIds
          }
        }
      });

      // Then delete results
      await tx.result.deleteMany({
        where: {
          enrollmentId: {
            in: enrollmentIds
          }
        }
      });
    });

    revalidateTag('results');

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function getAllResults<T extends boolean = false>(
  input?: GetResultSchema,
  options?: {
    includeDetails?: T;
  }
): Promise<{
  results: T extends true ? ResultWithDetails[] : Result[];
  pageCount: number;
}> {
  return await unstable_cache(
    async () => {
      try {
        const where: Prisma.ResultWhereInput = {};
        let paginate = true;

        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          // Search
          if (input.enrollmentId?.trim()) {
            where.OR = [
              {
                enrollmentId: {
                  equals: parseInt(input.enrollmentId) || undefined
                }
              },
              {
                enrollment: {
                  student: {
                    studentName: {
                      contains: input.enrollmentId,
                      mode: 'insensitive'
                    }
                  }
                }
              },
              {
                enrollment: {
                  class: {
                    className: {
                      contains: input.enrollmentId,
                      mode: 'insensitive'
                    }
                  }
                }
              }
            ];
          }

          const range = Array.isArray(input.createdAt)
            ? input.createdAt
            : typeof input.createdAt === 'string' &&
                input.createdAt.includes(',')
              ? input.createdAt.split(',')
              : null;

          if (range?.length === 2) {
            const [from, to] = range.map((ts) => new Date(Number(ts)));
            if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
              where.createdAt = { gte: from, lte: to };
            }
          }
        }

        const orderBy =
          input?.sort && input.sort.length > 0
            ? input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            : [{ createdAt: 'desc' }];

        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const [results, totalCount] = await prisma.$transaction([
          prisma.result.findMany({
            where,
            include: options?.includeDetails ? resultWithDetails : undefined,
            orderBy,
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.result.count({ where })
        ]);

        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

        return {
          results: results as T extends true ? ResultWithDetails[] : Result[],
          pageCount
        };
      } catch (error) {
        console.error('❌ Error fetching results:', error);
        return {
          results: [] as unknown as T extends true
            ? ResultWithDetails[]
            : Result[],
          pageCount: 0
        };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      revalidate: 1,
      tags: ['results']
    }
  )();
}

export async function getResultById(enrollmentId: string) {
  return await unstable_cache(
    async () => {
      try {
        const result = await prisma.result.findUnique({
          where: { enrollmentId: parseInt(enrollmentId) },
          include: {
            enrollment: {
              include: {
                student: true,
                class: {
                  include: {
                    subjects: {
                      include: {
                        subject: true
                      }
                    }
                  }
                },
                grades: true,
                semester: {
                  include: {
                    academicYear: true
                  }
                }
              }
            }
          }
        });

        if (!result) return null;

        // Prepare initial data for the form with all required fields
        const initialData = {
          studentId: result.enrollment.student.id,
          academicYearId: result.enrollment.semester.academicYear.id,
          semesterId: result.enrollment.semester.id,
          enrollmentId: result.enrollmentId,
          grades: result.enrollment.class.subjects.map((subject) => {
            const existingGrade = result.enrollment.grades.find(
              (g) => g.classSubjectId === subject.id
            );
            return {
              classSubjectId: subject.id,
              examMark: existingGrade?.examMark || 0,
              assignMark: existingGrade?.assignMark || 0
            };
          })
        };

        return initialData;
      } catch (error) {
        console.error(
          `❌ Error fetching result with ID ${enrollmentId}:`,
          error
        );
        return null;
      }
    },
    [`result-${enrollmentId}`],
    {
      revalidate: 1,
      tags: ['result', `result-${enrollmentId}`]
    }
  )();
}

////////////////////////////////////////////////

// actions/student-actions.ts

export async function getStudents() {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        studentName: true
      },
      orderBy: {
        studentName: 'asc'
      }
    });
    return { success: true, data: students };
  } catch (error) {
    console.error('Error fetching students:', error);
    return { success: false, error: 'Failed to fetch students' };
  }
}

// actions/academic-year-actions.ts

export async function getAcademicYears() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      select: {
        id: true,
        yearRange: true,
        isCurrent: true
      },
      orderBy: {
        yearRange: 'desc'
      }
    });
    return { success: true, data: academicYears };
  } catch (error) {
    console.error('Error fetching academic years:', error);
    return { success: false, error: 'Failed to fetch academic years' };
  }
}

// actions/semester-actions.ts

export async function getSemestersByAcademicYear(academicYearId: number) {
  try {
    const semesters = await prisma.semester.findMany({
      where: {
        academicYearId
      },
      select: {
        id: true,
        semesterName: true,
        isCurrent: true
      },
      orderBy: {
        semesterName: 'asc'
      }
    });
    return { success: true, data: semesters };
  } catch (error) {
    console.error('Error fetching semesters:', error);
    return { success: false, error: 'Failed to fetch semesters' };
  }
}

// actions/enrollment-actions.ts

export async function getEnrollmentsByStudentAndSemester(
  studentId: number,
  semesterId: number
) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        semesterId,
        isActive: true
      },
      select: {
        id: true,
        rollNumber: true,
        class: {
          select: {
            id: true,
            className: true,
            departmentCode: true
          }
        }
      },
      orderBy: {
        rollNumber: 'asc'
      }
    });
    return { success: true, data: enrollments };
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return { success: false, error: 'Failed to fetch enrollments' };
  }
}

// actions/subject-actions.ts

export async function getSubjectsByEnrollment(enrollmentId: number) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        class: {
          select: {
            subjects: {
              select: {
                id: true,
                subject: {
                  select: {
                    id: true,
                    subjectName: true,
                    creditHours: true,
                    examWeight: true,
                    assignWeight: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return { success: false, error: 'Enrollment not found' };
    }

    const subjects = enrollment.class.subjects.map((cs) => ({
      classSubjectId: cs.id,
      ...cs.subject
    }));

    return { success: true, data: subjects };
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return { success: false, error: 'Failed to fetch subjects' };
  }
}

// actions/grade-scale-actions.ts

export async function getGradeScale() {
  try {
    const gradeScale = await prisma.gradeScale.findMany({
      select: {
        minMark: true,
        maxMark: true,
        grade: true,
        score: true
      },
      orderBy: {
        minMark: 'desc'
      }
    });
    return { success: true, data: gradeScale };
  } catch (error) {
    console.error('Error fetching grade scale:', error);
    return { success: false, error: 'Failed to fetch grade scale' };
  }
}

// actions/result-actions.ts

export async function createResult(data: CreateResultFormData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function calculateGrade(finalMark: number, gradeScale: any[]) {
    const scale = gradeScale.find(
      (g) => finalMark >= g.minMark && finalMark <= g.maxMark
    );
    return scale || { grade: 'F', score: 0 };
  }

  function calculateGP(score: number, creditHour: number) {
    // Assuming 4.0 scale
    return (score / 100) * creditHour;
  }

  try {
    // Validate input
    const validatedData = createResultSchema.parse(data);

    // Check if result already exists
    const existingResult = await prisma.result.findUnique({
      where: { enrollmentId: validatedData.enrollmentId }
    });

    if (existingResult) {
      return {
        success: false,
        error: 'Result already exists for this enrollment'
      };
    }

    // Get grade scale
    const gradeScaleResult = await getGradeScale();
    if (!gradeScaleResult.success) {
      return { success: false, error: 'Failed to fetch grade scale' };
    }
    const gradeScale = gradeScaleResult.data!;

    // Get subjects for credit calculation
    const subjectsResult = await getSubjectsByEnrollment(
      validatedData.enrollmentId
    );
    if (!subjectsResult.success) {
      return { success: false, error: 'Failed to fetch subjects' };
    }
    const subjects = subjectsResult.data!;

    // Calculate grades and prepare data
    const gradesData = validatedData.grades.map((gradeInput) => {
      const subject = subjects.find(
        (s) => s.classSubjectId === gradeInput.classSubjectId
      )!;

      const finalMark =
        gradeInput.examMark * subject.examWeight +
        gradeInput.assignMark * subject.assignWeight;

      const gradeInfo = calculateGrade(finalMark, gradeScale);
      const gp = calculateGP(gradeInfo.score, subject.creditHours);

      return {
        enrollmentId: validatedData.enrollmentId,
        classSubjectId: gradeInput.classSubjectId,
        examMark: gradeInput.examMark,
        assignMark: gradeInput.assignMark,
        finalMark: Math.round(finalMark * 100) / 100,
        grade: gradeInfo.grade,
        score: gradeInfo.score,
        gp,
        creditHours: subject.creditHours
      };
    });

    // Calculate GPA
    const totalCredits = gradesData.reduce((sum, g) => sum + g.creditHours, 0);
    const totalGradePoints = gradesData.reduce(
      (sum, g) => sum + g.gp * g.creditHours,
      0
    );
    const gpa = totalGradePoints / totalCredits;

    // Create grades and result in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create grades
      const createdGrades = await Promise.all(
        gradesData.map((gradeData) =>
          tx.grade.create({
            data: {
              enrollmentId: gradeData.enrollmentId,
              classSubjectId: gradeData.classSubjectId,
              examMark: gradeData.examMark,
              assignMark: gradeData.assignMark,
              finalMark: gradeData.finalMark,
              grade: gradeData.grade,
              score: gradeData.score,
              gp: gradeData.gp
            }
          })
        )
      );

      // Create result
      const createdResult = await tx.result.create({
        data: {
          enrollmentId: validatedData.enrollmentId,
          gpa: Math.round(gpa * 100) / 100,
          totalCredits
        }
      });

      return { grades: createdGrades, result: createdResult };
    });

    revalidateTag('results');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating result:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create result'
    };
  }
}

// Helper function to calculate grade and GPA based on marks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateGradeDetails(finalMark: number, gradeScales: any[]) {
  // Sort grade scales by minMark descending to find the correct grade
  const sortedScales = gradeScales.sort((a, b) => b.minMark - a.minMark);

  for (const scale of sortedScales) {
    if (finalMark >= scale.minMark && finalMark <= scale.maxMark) {
      return {
        grade: scale.grade,
        score: scale.score,
        gp: scale.score // Assuming GP is same as score, adjust if different
      };
    }
  }

  // Default to lowest grade if no match found
  const lowestGrade = sortedScales[sortedScales.length - 1];
  return {
    grade: lowestGrade?.grade || 'F',
    score: lowestGrade?.score || 0,
    gp: lowestGrade?.score || 0
  };
}

export async function updateResult(input: UpdateResultFormData) {
  try {
    // Validate input
    const validatedInput = updateResultSchema.parse(input);
    const { enrollmentId, studentId, academicYearId, semesterId, grades } =
      validatedInput;

    // Check if enrollment exists and verify it matches the provided details
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        semester: true,
        class: true
      }
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }

    // Verify enrollment context
    if (
      enrollment.studentId !== studentId ||
      enrollment.semesterId !== semesterId ||
      enrollment.semester.academicYearId !== academicYearId
    ) {
      return {
        success: false,
        error: 'Enrollment context mismatch'
      };
    }

    // Get class subjects for this enrollment
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        classId: enrollment.classId
      },
      include: {
        subject: true
      }
    });

    if (classSubjects.length === 0) {
      return {
        success: false,
        error: 'No subjects found for this class'
      };
    }

    // Validate that all provided grades correspond to valid class subjects
    const validClassSubjectIds = classSubjects.map((cs) => cs.id);
    const invalidGrades = grades.filter(
      (grade) => !validClassSubjectIds.includes(grade.classSubjectId)
    );

    if (invalidGrades.length > 0) {
      return {
        success: false,
        error: 'Some grades reference invalid subjects for this class'
      };
    }

    // Get grade scales for calculation
    const gradeScales = await prisma.gradeScale.findMany({
      orderBy: { minMark: 'desc' }
    });

    if (gradeScales.length === 0) {
      return {
        success: false,
        error: 'No grade scales configured. Please contact administrator.'
      };
    }

    // Calculate grades with weighted marks
    const processedGrades = grades.map((gradeInput) => {
      const classSubject = classSubjects.find(
        (cs) => cs.id === gradeInput.classSubjectId
      );
      if (!classSubject) {
        throw new Error(
          `ClassSubject not found for ID: ${gradeInput.classSubjectId}`
        );
      }

      // Calculate final mark using subject weights
      const finalMark =
        gradeInput.examMark * classSubject.subject.examWeight +
        gradeInput.assignMark * classSubject.subject.assignWeight;

      // Get grade details based on final mark
      const gradeDetails = calculateGradeDetails(finalMark, gradeScales);

      return {
        classSubjectId: gradeInput.classSubjectId,
        examMark: gradeInput.examMark,
        assignMark: gradeInput.assignMark,
        finalMark: Math.round(finalMark * 100) / 100,
        grade: gradeDetails.grade,
        score: gradeDetails.score,
        gp: gradeDetails.gp,
        creditHours: classSubject.subject.creditHours
      };
    });

    // Calculate GPA and total credits
    const totalCreditHours = processedGrades.reduce(
      (sum, grade) => sum + grade.creditHours,
      0
    );
    const totalGradePoints = processedGrades.reduce(
      (sum, grade) => sum + grade.gp * grade.creditHours,
      0
    );
    const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;

    // Update grades and result in a transaction
    const updatedResult = await prisma.$transaction(async (tx) => {
      // Delete existing grades for this enrollment
      await tx.grade.deleteMany({
        where: { enrollmentId }
      });

      // Create new grades
      await tx.grade.createMany({
        data: processedGrades.map((grade) => ({
          enrollmentId,
          classSubjectId: grade.classSubjectId,
          examMark: grade.examMark,
          assignMark: grade.assignMark,
          finalMark: grade.finalMark,
          grade: grade.grade,
          score: grade.score,
          gp: grade.gp
        }))
      });

      // Update or create result
      const result = await tx.result.upsert({
        where: { enrollmentId },
        update: {
          gpa: Math.round(gpa * 100) / 100,
          totalCredits: totalCreditHours,
          updatedAt: new Date()
        },
        create: {
          enrollmentId,
          gpa: Math.round(gpa * 100) / 100,
          totalCredits: totalCreditHours
        }
      });

      return result;
    });

    // Update rank (optional - can be done in a separate process)
    // await updateResultRanks(semesterId);

    // Revalidate relevant paths
    revalidateTag('results');
    revalidateTag('result');
    revalidateTag(`results-${enrollmentId}`);

    return {
      success: true,
      data: updatedResult
    };
  } catch (error) {
    console.error('Error updating result:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        details: error.errors
      };
    }

    return {
      success: false,
      error: 'Failed to update result'
    };
  }
}

// Helper function to update ranks after result changes
async function updateResultRanks(semesterId: number) {
  try {
    // Get all results for the semester, ordered by GPA
    const results = await prisma.result.findMany({
      where: {
        enrollment: {
          semesterId
        }
      },
      orderBy: {
        gpa: 'desc'
      }
    });

    // Update ranks
    const updatePromises = results.map((result, index) =>
      prisma.result.update({
        where: { enrollmentId: result.enrollmentId },
        data: { rank: index + 1 }
      })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating ranks:', error);
    // Don't throw error here as it's not critical for the main operation
  }
}

// Function to get result data for editing
export async function getResultForEdit(enrollmentId: number) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            studentName: true
          }
        },
        semester: {
          select: {
            id: true,
            semesterName: true,
            isCurrent: true,
            academicYear: {
              select: {
                id: true,
                yearRange: true,
                isCurrent: true
              }
            }
          }
        },
        class: {
          select: {
            id: true,
            className: true,
            departmentCode: true
          }
        },
        grades: {
          include: {
            classSubject: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return {
        success: false,
        error: 'Enrollment not found'
      };
    }

    // Transform the data to match the form structure
    const formData = {
      enrollmentId: enrollment.id,
      studentId: enrollment.studentId,
      academicYearId: enrollment.semester.academicYear.id,
      semesterId: enrollment.semesterId,
      grades: enrollment.grades.map((grade) => ({
        classSubjectId: grade.classSubjectId,
        examMark: grade.examMark,
        assignMark: grade.assignMark
      }))
    };

    return {
      success: true,
      data: formData
    };
  } catch (error) {
    console.error('Error fetching result for edit:', error);
    return {
      success: false,
      error: 'Failed to fetch result'
    };
  }
}

export async function checkExistingResult(enrollmentId: number) {
  try {
    // Replace with your actual database query
    const existingResult = await prisma.result.findFirst({
      where: {
        enrollmentId: enrollmentId
      },
      include: {
        enrollment: {
          include: {
            student: true,
            class: true
          }
        }
      }
    });

    return {
      success: true,
      data: existingResult
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to check existing result'
    };
  }
}
