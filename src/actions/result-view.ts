'use server';

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
    };
    examMark: number;
    assignMark: number;
    finalMark: number;
    grade: string;
    gp: number;
    score: number;
  }>;
  gradeScales: {
    gradeDescRow1: Array<{
      grade: string;
      range: string;
      display: string;
    }>;
    gradeDescRow2: Array<{
      grade: string;
      range: string;
      display: string;
    }>;
    gradeScoreRow1: Array<{
      score: string;
      range: string;
      display: string;
    }>;
    gradeScoreRow2: Array<{
      score: string;
      range: string;
      display: string;
    }>;
  };
};

export async function getResultById(
  resultId: string
): Promise<ResultData | null> {
  try {
    const enrollmentId = parseInt(resultId);

    if (isNaN(enrollmentId)) {
      throw new Error('Invalid result ID');
    }

    // Fetch result with all related data
    const result = await prisma.result.findUnique({
      where: {
        enrollmentId: enrollmentId
      },
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
                    subjectName: 'asc'
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

    function splitIntoTwoRows<T>(array: T[]) {
      if (array.length === 0) {
        return { row1: [], row2: [] };
      }

      if (array.length === 1) {
        return { row1: array, row2: [] };
      }

      // For even distribution, use Math.ceil to put extra item in first row if odd number
      const midpoint = Math.ceil(array.length / 2);

      return {
        row1: array.slice(0, midpoint),
        row2: array.slice(midpoint)
      };
    }

    const gradeScales = await prisma.gradeScale.findMany({
      orderBy: { minMark: 'desc' }
    });

    const gradeDescriptions = gradeScales.map((scale) => ({
      grade: scale.grade,
      range:
        scale.maxMark === 100
          ? `(>${scale.minMark})`
          : `(${scale.minMark}-${scale.maxMark})`,
      display: `${scale.grade} ${scale.maxMark === 100 ? `(>${scale.minMark})` : `(${scale.minMark}-${scale.maxMark})`}`
    }));

    const gradeScoreDescriptions = gradeScales.map((scale) => ({
      score: scale.score.toFixed(2),
      range:
        scale.maxMark === 100
          ? `(>${scale.minMark})`
          : `(${scale.minMark}-${scale.maxMark})`,
      display: `${scale.score.toFixed(2)} ${scale.maxMark === 100 ? `(>${scale.minMark})` : `(${scale.minMark}-${scale.maxMark})`}`
    }));

    const gradeDescRows = splitIntoTwoRows(gradeDescriptions);
    const gradeScoreRows = splitIntoTwoRows(gradeScoreDescriptions);

    // Transform the data to match the expected format
    const transformedData: ResultData = {
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
          creditHours: grade.classSubject.subject.creditHours
        },
        examMark: grade.examMark,
        assignMark: grade.assignMark,
        finalMark: grade.finalMark,
        grade: grade.grade,
        gp: grade.gp,
        score: grade.score
      })),
      gradeScales: {
        // Grade descriptions in two rows
        gradeDescRow1: gradeDescRows.row1,
        gradeDescRow2: gradeDescRows.row2,

        // Grade score descriptions in two rows
        gradeScoreRow1: gradeScoreRows.row1,
        gradeScoreRow2: gradeScoreRows.row2
      }
    };

    return transformedData;
  } catch (error) {
    console.error('Error fetching result:', error);
    throw new Error('Failed to fetch result data');
  } finally {
    await prisma.$disconnect();
  }
}

export async function getResultsByClass(classId: number, semesterId: number) {
  try {
    const results = await prisma.result.findMany({
      where: {
        enrollment: {
          classId: classId,
          semesterId: semesterId
        }
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      }
    });

    return results.map((result) => ({
      enrollmentId: result.enrollmentId,
      studentName: result.enrollment.student.studentName,
      rollNumber: result.enrollment.rollNumber,
      gpa: result.gpa,
      totalCredits: result.totalCredits
    }));
  } catch (error) {
    console.error('Error fetching class results:', error);
    throw new Error('Failed to fetch class results');
  } finally {
    await prisma.$disconnect();
  }
}
