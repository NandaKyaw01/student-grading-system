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
    rank: number | null;
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
  }>;
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
        rank: result.rank
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
        gp: grade.gp
      }))
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
      },
      orderBy: {
        rank: 'asc'
      }
    });

    return results.map((result) => ({
      enrollmentId: result.enrollmentId,
      studentName: result.enrollment.student.studentName,
      rollNumber: result.enrollment.rollNumber,
      gpa: result.gpa,
      totalCredits: result.totalCredits,
      rank: result.rank
    }));
  } catch (error) {
    console.error('Error fetching class results:', error);
    throw new Error('Failed to fetch class results');
  } finally {
    await prisma.$disconnect();
  }
}
