'use server';

import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import { revalidateTag, unstable_cache } from 'next/cache';

import {
  GradeScale,
  Prisma,
  PrismaClient,
  Result,
  Status
} from '@/generated/prisma';
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

      await updateAcademicYearResult(enrollmentId, tx);
    });

    revalidateTag('results');
    revalidateTag('academic-year-results');
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
    useCache?: boolean;
  }
): Promise<{
  results: T extends true ? ResultWithDetails[] : Result[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.ResultWhereInput = {};
      let paginate = true;

      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        // Search
        if (input.search?.trim()) {
          where.OR = [
            {
              enrollment: {
                student: {
                  studentName: {
                    contains: input.search,
                    mode: 'insensitive'
                  }
                }
              }
            },
            {
              enrollment: {
                rollNumber: {
                  contains: input.search,
                  mode: 'insensitive'
                }
              }
            }
          ];
        }

        if (input?.academicYearId && input?.academicYearId?.length > 0) {
          where.enrollment = {
            semester: {
              academicYearId: {
                in: input.academicYearId
              }
            }
          };
        }

        if (input?.semesterId && input?.semesterId?.length > 0) {
          where.enrollment = {
            semesterId: {
              in: input.semesterId
            }
          };
        }

        if (input?.classId && input?.classId?.length > 0) {
          where.enrollment = {
            classId: {
              in: input.classId
            }
          };
        }

        const range = Array.isArray(input.createdAt)
          ? input.createdAt
          : typeof input.createdAt === 'string' && input.createdAt.includes(',')
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
          ? [
              ...input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            ]
          : [{ createdAt: 'desc' }, { enrollmentId: 'desc' }];

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
  };

  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [JSON.stringify(input ?? {}) + JSON.stringify(options ?? {})],
      {
        revalidate: 1,
        tags: ['results']
      }
    )();
  }

  return await queryFunction();
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
              baseMark: existingGrade?.baseMark || 0,
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

export async function getEnrollmentsByStudentAndSemester(
  studentId: number,
  semesterId: number
) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        semesterId
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
    return { success: true, data: gradeScale as GradeScale[] };
  } catch (error) {
    console.error('Error fetching grade scale:', error);
    return { success: false, error: 'Failed to fetch grade scale' };
  }
}

// Helper function to calculate grade and GPA based on marks
function calculateGradeDetails(finalMark: number, gradeScales: GradeScale[]) {
  // Sort grade scales by minMark descending to find the correct grade
  const sortedScales = gradeScales.sort((a, b) => b.minMark - a.minMark);

  for (const scale of sortedScales) {
    if (finalMark >= scale.minMark && finalMark <= scale.maxMark) {
      return {
        grade: scale.grade,
        score: scale.score
      };
    }
  }

  // Default to lowest grade if no match found
  const lowestGrade = sortedScales[sortedScales.length - 1];
  return {
    grade: lowestGrade?.grade || 'F',
    score: lowestGrade?.score || 0
  };
}

function calculateGP(score: number, creditHour: number) {
  return score * creditHour;
}

function calculateResultStatus(grades: Array<{ finalMark: number }>): Status {
  // Check if all subjects have finalMark >= 50
  const allPassed = grades.every((grade) => grade.finalMark >= 50);
  return allPassed ? 'PASS' : 'FAIL';
}

// Type for transaction client
type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Helper function to update or create AcademicYearResult
export async function updateAcademicYearResult(
  enrollmentId: number,
  tx: TransactionClient
): Promise<number> {
  // Get enrollment details
  const enrollment = await tx.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      semester: {
        include: {
          academicYear: {
            include: {
              semesters: true
            }
          }
        }
      },
      student: true,
      class: true,
      result: true
    }
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  const { studentId, classId } = enrollment;
  const { academicYear } = enrollment.semester;
  const totalSemestersInYear = academicYear.semesters.length;

  // Get all results for this student in this academic year and class
  const allResults = await tx.result.findMany({
    where: {
      enrollment: {
        studentId,
        // classId,
        semester: {
          academicYearId: academicYear.id
        }
      }
    },
    include: {
      enrollment: {
        include: {
          semester: true
        }
      }
    }
  });

  const semesterCount = allResults.length;

  const isComplete = semesterCount === totalSemestersInYear;

  // Calculate aggregated values only if we have results
  let overallGpa = 0.0;
  let totalCredits = 0.0;
  let totalGp = 0.0;
  let status: Status = 'INCOMPLETE';

  if (semesterCount > 0) {
    totalCredits = allResults.reduce(
      (sum, result) => sum + result.totalCredits,
      0
    );
    totalGp = allResults.reduce((sum, result) => sum + result.totalGp, 0);

    // Calculate weighted overall GPA based on total credits
    overallGpa = totalCredits > 0 ? totalGp / totalCredits : 0;

    // Determine status
    if (isComplete) {
      // If all semesters are complete, check if all passed
      const allSemestersPassed = allResults.every(
        (result) => result.status === 'PASS'
      );
      status = allSemestersPassed ? 'PASS' : 'FAIL';
    } else {
      // If not all semesters are complete, check current results
      const hasAnyFailure = allResults.some(
        (result) => result.status === 'FAIL'
      );
      status = hasAnyFailure ? 'FAIL' : 'INCOMPLETE';
    }
  }

  // Update or create AcademicYearResult - this should only create ONE record per student/year/class
  const academicYearResult = await tx.academicYearResult.upsert({
    where: {
      studentId_academicYearId: {
        studentId,
        academicYearId: academicYear.id
      }
    },
    update: {
      overallGpa: parseFloat(overallGpa.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      totalGp: parseFloat(totalGp.toFixed(2)),
      semesterCount,
      isComplete,
      status,
      updatedAt: new Date()
    },
    create: {
      studentId,
      academicYearId: academicYear.id,
      // classId,
      overallGpa: parseFloat(overallGpa.toFixed(2)),
      totalCredits: parseFloat(totalCredits.toFixed(2)),
      totalGp: parseFloat(totalGp.toFixed(2)),
      semesterCount,
      isComplete,
      status
    }
  });

  return academicYearResult.id;
}

export async function createResult(data: CreateResultFormData) {
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

      const examMark = gradeInput.baseMark * subject.examWeight;
      const finalMark = examMark + gradeInput.assignMark;

      const roundedFinalMark = Math.round(finalMark);

      const gradeInfo = calculateGradeDetails(roundedFinalMark, gradeScale);
      const gp = calculateGP(gradeInfo.score, subject.creditHours);

      return {
        enrollmentId: validatedData.enrollmentId,
        classSubjectId: gradeInput.classSubjectId,
        baseMark: gradeInput.baseMark,
        examMark: examMark,
        assignMark: gradeInput.assignMark,
        finalMark: roundedFinalMark,
        grade: gradeInfo.grade,
        score: gradeInfo.score,
        gp,
        creditHours: subject.creditHours
      };
    });

    // Calculate GPA and status
    const totalCredits = gradesData.reduce((sum, g) => sum + g.creditHours, 0);
    const totalGradePoints = gradesData.reduce((sum, g) => sum + g.gp, 0);
    const gpa = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
    const status = calculateResultStatus(gradesData);

    // Create grades and result in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create grades
      const createdGrades = await Promise.all(
        gradesData.map((gradeData) =>
          tx.grade.create({
            data: {
              enrollmentId: gradeData.enrollmentId,
              classSubjectId: gradeData.classSubjectId,
              baseMark: parseFloat(gradeData.baseMark.toFixed(2)),
              examMark: parseFloat(gradeData.examMark.toFixed(2)),
              assignMark: parseFloat(gradeData.assignMark.toFixed(2)),
              finalMark: parseFloat(gradeData.finalMark.toFixed(2)),
              grade: gradeData.grade,
              score: parseFloat(gradeData.score.toFixed(2)),
              gp: parseFloat(gradeData.gp.toFixed(2))
            }
          })
        )
      );

      // Create result and link it to the AcademicYearResult
      await tx.result.create({
        data: {
          enrollmentId: validatedData.enrollmentId,
          gpa: parseFloat(gpa.toFixed(2)),
          totalCredits: parseFloat(totalCredits.toFixed(2)),
          totalGp: parseFloat(totalGradePoints.toFixed(2)),
          status,
          academicYearResultId: null // Link to the shared AcademicYearResult
        }
      });

      // Now update/create AcademicYearResult after the result exists
      const academicYearResultId = await updateAcademicYearResult(
        validatedData.enrollmentId,
        tx
      );

      // Update the result to link it to the AcademicYearResult
      const updatedResult = await tx.result.update({
        where: { enrollmentId: validatedData.enrollmentId },
        data: { academicYearResultId }
      });

      return { grades: createdGrades, result: updatedResult };
    });

    revalidateTag('results');
    revalidateTag('academic-year-results');

    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating result:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create result'
    };
  }
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

      const examMark = gradeInput.baseMark * classSubject.subject.examWeight;
      const finalMark = examMark + gradeInput.assignMark;
      const roundedFinalMark = Math.round(finalMark);

      // Get grade details based on final mark
      const gradeDetails = calculateGradeDetails(roundedFinalMark, gradeScales);
      const gp = calculateGP(
        gradeDetails.score,
        classSubject.subject.creditHours
      );

      return {
        classSubjectId: gradeInput.classSubjectId,
        baseMark: gradeInput.baseMark,
        examMark: examMark,
        assignMark: gradeInput.assignMark,
        finalMark: roundedFinalMark,
        grade: gradeDetails.grade,
        score: gradeDetails.score,
        gp,
        creditHours: classSubject.subject.creditHours
      };
    });

    // Calculate GPA, total credits, and status
    const totalCreditHours = processedGrades.reduce(
      (sum, grade) => sum + grade.creditHours,
      0
    );
    const totalGradePoints = processedGrades.reduce(
      (sum, grade) => sum + grade.gp,
      0
    );
    const gpa = totalCreditHours > 0 ? totalGradePoints / totalCreditHours : 0;
    const status = calculateResultStatus(processedGrades);

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
          baseMark: parseFloat(grade.baseMark.toFixed(2)),
          examMark: parseFloat(grade.examMark.toFixed(2)),
          assignMark: parseFloat(grade.assignMark.toFixed(2)),
          finalMark: parseFloat(grade.finalMark.toFixed(2)),
          grade: grade.grade,
          score: parseFloat(grade.score.toFixed(2)),
          gp: parseFloat(grade.gp.toFixed(2))
        }))
      });

      // Update or create result
      await tx.result.upsert({
        where: { enrollmentId },
        update: {
          gpa: parseFloat(gpa.toFixed(2)),
          totalCredits: parseFloat(totalCreditHours.toFixed(2)),
          totalGp: parseFloat(totalGradePoints.toFixed(2)),
          status,
          academicYearResultId: null, // Ensure it's linked to the shared AcademicYearResult
          updatedAt: new Date()
        },
        create: {
          enrollmentId,
          gpa: parseFloat(gpa.toFixed(2)),
          totalGp: parseFloat(totalGradePoints.toFixed(2)),
          totalCredits: parseFloat(totalCreditHours.toFixed(2)),
          status,
          academicYearResultId: null // Link to the shared AcademicYearResult
        }
      });

      // Now update/create AcademicYearResult after the result exists
      const academicYearResultId = await updateAcademicYearResult(
        enrollmentId,
        tx
      );

      // Update the result to link it to the AcademicYearResult
      const updatedResult = await tx.result.update({
        where: { enrollmentId: enrollmentId },
        data: { academicYearResultId }
      });

      return updatedResult;
    });

    // Revalidate relevant paths
    revalidateTag('results');
    revalidateTag('academic-year-results');
    revalidateTag(`result-${enrollmentId}`);

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
