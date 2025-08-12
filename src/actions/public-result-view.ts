'use server';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';

export type ResultData = {
  student: {
    name: string;
    rollNumber: string;
  };
  enrollment: {
    class: string;
    departmentCode: string;
    semester: string;
    academicYear: string;
  };
  result: {
    gpa: number;
    totalCredits: number;
    totalGp: number;
  };
  grades: Array<{
    subject: {
      id: string;
      name: string;
      creditHours: number;
      priority: number;
    };
    baseMark: number;
    examMark: number;
    assignMark: number;
    finalMark: number;
    grade: string;
    gp: number;
    score: number;
  }>;
  gradeScales: Array<{
    grade: string;
    score: string;
  }>;
};

export type SearchFilters = {
  academicYears: Array<{ id: number; yearRange: string }>;
  semesters: Array<{ id: number; semesterName: string }>;
  classes: Array<{ id: number; className: string; departmentCode: string }>;
};

export type SearchParams = {
  academicYear?: string;
  semester?: string;
  class?: string;
  studentName?: string;
  admissionId?: string;
  rollNumber?: string;
};

export async function getSearchFilters(): Promise<SearchFilters> {
  try {
    const [academicYears, semesters, classes] = await Promise.all([
      prisma.academicYear.findMany({
        orderBy: { yearRange: 'desc' },
        select: { id: true, yearRange: true }
      }),
      prisma.semester.findMany({
        orderBy: { semesterName: 'asc' },
        select: { id: true, semesterName: true }
      }),
      prisma.class.findMany({
        orderBy: [{ departmentCode: 'asc' }, { className: 'asc' }],
        select: { id: true, className: true, departmentCode: true }
      })
    ]);

    return {
      academicYears,
      semesters,
      classes
    };
  } catch (error) {
    console.error('Error fetching search filters:', error);
    return {
      academicYears: [],
      semesters: [],
      classes: []
    };
  }
}

export async function searchResults(
  searchParams: SearchParams
): Promise<ResultData | null> {
  try {
    // Build the where clause based on search parameters
    const where: Prisma.ResultWhereInput = {
      enrollment: {
        AND: []
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollmentConditions: any[] = [];

    // Filter by academic year
    if (searchParams.academicYear) {
      enrollmentConditions.push({
        class: {
          semester: {
            academicYearId: parseInt(searchParams.academicYear)
          }
        }
      });
    }

    if (searchParams.semester) {
      enrollmentConditions.push({
        semesterId: parseInt(searchParams.semester)
      });
    }

    if (searchParams.class) {
      enrollmentConditions.push({
        classId: parseInt(searchParams.class)
      });
    }

    if (searchParams.studentName) {
      enrollmentConditions.push({
        student: {
          studentName: {
            equals: searchParams.studentName,
            mode: 'insensitive'
          }
        }
      });
    }
    if (searchParams.admissionId) {
      enrollmentConditions.push({
        student: {
          admissionId: {
            equals: searchParams.admissionId,
            mode: 'insensitive'
          }
        }
      });
    }

    // Add rollNumber filter
    if (searchParams.rollNumber) {
      enrollmentConditions.push({
        rollNumber: {
          equals: searchParams.rollNumber,
          mode: 'insensitive'
        }
      });
    }

    where.enrollment!.AND = enrollmentConditions;

    // Fetch results with all related data
    const result = await prisma.result.findFirst({
      where,
      include: {
        enrollment: {
          include: {
            student: true,
            class: {
              include: {
                semester: {
                  include: {
                    academicYear: true
                  }
                }
              }
            },
            grades: {
              include: {
                classSubject: {
                  include: {
                    subject: true
                  }
                }
              },
              orderBy: {
                classSubject: {
                  subject: {
                    priority: 'asc'
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!result) {
      return null;
    }

    // Get grade scales
    const gradeScales = await prisma.gradeScale.findMany({
      orderBy: { minMark: 'desc' },
      take: 8
    });

    // Transform the data to match the expected format
    const transformedResults: ResultData = {
      student: {
        name: result.enrollment.student.studentName,
        rollNumber: result.enrollment.rollNumber
      },
      enrollment: {
        class: result.enrollment.class.className,
        departmentCode: result.enrollment.class.departmentCode,
        semester: result.enrollment.class.semester.semesterName,
        academicYear: result.enrollment.class.semester.academicYear.yearRange
      },
      result: {
        gpa: result.gpa,
        totalCredits: result.totalCredits,
        totalGp: result.totalGp
      },
      grades: result.enrollment.grades.map((grade) => ({
        subject: {
          id: grade.classSubject.subject.id,
          name: grade.classSubject.subject.subjectName,
          creditHours: grade.classSubject.subject.creditHours,
          priority: grade.classSubject.subject.priority!
        },
        baseMark: grade.baseMark,
        examMark: grade.examMark,
        assignMark: grade.assignMark,
        finalMark: grade.finalMark,
        grade: grade.grade,
        gp: grade.gp,
        score: grade.score
      })),
      gradeScales: gradeScales.map((scale) => ({
        grade: `${scale.grade} (${scale.minMark}-${scale.maxMark})`,
        score: `${scale.score.toFixed(2)} (${scale.minMark}-${scale.maxMark})`
      }))
    };

    return transformedResults;
  } catch (error) {
    console.error('Error searching results:', error);
    return null;
  }
}

export async function getSemestersByAcademicYear(academicYearId: number) {
  try {
    const semesters = await prisma.semester.findMany({
      where: { academicYearId },
      orderBy: { semesterName: 'asc' }
      // select: { id: true, semesterName: true }
    });
    return semesters;
  } catch (error) {
    console.error('Error fetching semesters:', error);
    throw new Error('Failed to fetch semesters');
  }
}

export async function getClassesBySemester(semesterId: number) {
  try {
    const classes = await prisma.class.findMany({
      where: { semesterId },
      orderBy: [{ departmentCode: 'asc' }, { className: 'asc' }]
    });
    return classes;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw new Error('Failed to fetch classes');
  }
}
