'use server';

import { prisma } from '@/lib/db';

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  currentSemester: string;
  currentAcademicYear: string;
}

export interface ClassWithEnrollments {
  id: number;
  className: string;
  departmentCode: string;
  _count: {
    enrollments: number;
  };
  semester: {
    semesterName: string;
    academicYear: {
      yearRange: string;
    };
  };
}

export interface TopPerformingStudent {
  id: number;
  studentName: string;
  admissionId: string;
  gpa: number;
  className: string;
  departmentCode: string;
}

export interface RecentEnrollment {
  id: number;
  rollNumber: string;
  isActive: boolean;
  createdAt: Date;
  student: {
    studentName: string;
    admissionId: string;
  };
  class: {
    className: string;
    departmentCode: string;
  };
}

export interface SubjectPerformance {
  subjectName: string;
  averageGpa: number;
  totalStudents: number;
  passRate: number;
}

export interface SemesterData {
  id: number;
  semesterName: string;
  isCurrent: boolean;
  _count: {
    enrollments: number;
    classes: number;
  };
  academicYear: {
    yearRange: string;
  };
}

// Generic response type for error handling
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getAcademicYearId(
  yearRange?: string
): Promise<number | null> {
  if (!yearRange || yearRange === 'current') {
    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true }
    });
    return currentYear?.id || null;
  } else {
    const year = await prisma.academicYear.findFirst({
      where: { yearRange },
      select: { id: true }
    });
    return year?.id || null;
  }
}

export async function getDashboardStats(
  academicYearId: number | null
): Promise<ServiceResponse<DashboardStats>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }

    const [
      totalStudents,
      totalClasses,
      totalSubjects,
      currentSemester,
      currentAcademicYear
    ] = await Promise.all([
      prisma.enrollment.count({
        where: {
          semester: {
            academicYearId: academicYearId
          }
        }
      }),
      prisma.class.count({
        where: {
          semester: {
            academicYearId: academicYearId
          }
        }
      }),
      prisma.classSubject.count({
        where: {
          class: {
            semester: {
              academicYearId: academicYearId
            }
          }
        }
      }),
      prisma.semester.findFirst({
        where: { isCurrent: true },
        select: { semesterName: true }
      }),
      prisma.academicYear.findFirst({
        where: { id: academicYearId },
        select: { yearRange: true }
      })
    ]);

    return {
      success: true,
      data: {
        totalStudents,
        totalClasses,
        totalSubjects,
        currentSemester: currentSemester?.semesterName || 'N/A',
        currentAcademicYear: currentAcademicYear?.yearRange || 'N/A'
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      error: 'Failed to fetch dashboard statistics'
    };
  }
}

export async function getClassesWithEnrollments(
  academicYearId: number | null
): Promise<ServiceResponse<ClassWithEnrollments[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }

    const classes = await prisma.class.findMany({
      select: {
        id: true,
        className: true,
        departmentCode: true,
        _count: {
          select: {
            enrollments: true
          }
        },
        semester: {
          select: {
            semesterName: true,
            academicYear: {
              select: {
                yearRange: true
              }
            }
          }
        }
      },
      where: {
        semester: {
          academicYearId: academicYearId
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const mappedClasses = classes.map((cls) => ({
      ...cls,
      departmentCode: cls.departmentCode as string
    }));

    return {
      success: true,
      data: mappedClasses
    };
  } catch (error) {
    console.error('Error fetching classes with enrollments:', error);
    return {
      success: false,
      error: 'Failed to fetch classes data'
    };
  }
}

export async function getTopPerformingStudents(
  academicYearId: number | null
): Promise<ServiceResponse<TopPerformingStudent[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }

    const topStudents = await prisma.result.findMany({
      select: {
        gpa: true,
        enrollment: {
          select: {
            student: {
              select: {
                id: true,
                studentName: true,
                admissionId: true
              }
            },
            class: {
              select: {
                className: true,
                departmentCode: true
              }
            }
          }
        }
      },
      where: {
        enrollment: {
          semester: {
            academicYearId: academicYearId
          }
        }
      },
      orderBy: {
        gpa: 'desc'
      },
      take: 10
    });

    const mappedStudents = topStudents.map((result) => ({
      id: result.enrollment.student.id,
      studentName: result.enrollment.student.studentName,
      admissionId: result.enrollment.student.admissionId,
      gpa: result.gpa,
      className: result.enrollment.class.className,
      departmentCode: result.enrollment.class.departmentCode as string
    }));

    return {
      success: true,
      data: mappedStudents
    };
  } catch (error) {
    console.error('Error fetching top performing students:', error);
    return {
      success: false,
      error: 'Failed to fetch top performing students'
    };
  }
}

export async function getRecentEnrollments(
  academicYearId: number | null
): Promise<ServiceResponse<RecentEnrollment[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }

    const recentEnrollments = await prisma.enrollment.findMany({
      select: {
        id: true,
        rollNumber: true,
        isActive: true,
        createdAt: true,
        student: {
          select: {
            studentName: true,
            admissionId: true
          }
        },
        class: {
          select: {
            className: true,
            departmentCode: true
          }
        }
      },
      where: {
        semester: {
          academicYearId: academicYearId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const mappedEnrollments = recentEnrollments.map((enrollment) => ({
      ...enrollment,
      class: {
        ...enrollment.class,
        departmentCode: enrollment.class.departmentCode as string
      }
    }));

    return {
      success: true,
      data: mappedEnrollments
    };
  } catch (error) {
    console.error('Error fetching recent enrollments:', error);
    return {
      success: false,
      error: 'Failed to fetch recent enrollments'
    };
  }
}

export async function getSubjectPerformance(
  academicYearId: number | null
): Promise<ServiceResponse<SubjectPerformance[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }
    const subjectPerformance = await prisma.subject.findMany({
      select: {
        subjectName: true,
        classes: {
          select: {
            grades: {
              select: {
                gp: true,
                score: true
              }
            }
          }
        }
      },
      where: {
        classes: {
          some: {
            class: {
              enrollments: {
                some: {
                  semester: {
                    academicYearId: academicYearId
                  }
                }
              }
            }
          }
        }
      }
    });

    const mappedPerformance = subjectPerformance
      .map((subject) => {
        const allGrades = subject.classes.flatMap((cls) => cls.grades);
        const totalStudents = allGrades.length;
        const averageGpa =
          totalStudents > 0
            ? allGrades.reduce((sum, grade) => sum + grade.gp, 0) /
              totalStudents
            : 0;
        const passRate =
          totalStudents > 0
            ? (allGrades.filter((grade) => grade.score >= 50).length /
                totalStudents) *
              100
            : 0;

        return {
          subjectName: subject.subjectName,
          averageGpa: parseFloat(averageGpa.toFixed(2)),
          totalStudents,
          passRate: parseFloat(passRate.toFixed(2))
        };
      })
      .filter((subject) => subject.totalStudents > 0);

    return {
      success: true,
      data: mappedPerformance
    };
  } catch (error) {
    console.error('Error fetching subject performance:', error);
    return {
      success: false,
      error: 'Failed to fetch subject performance'
    };
  }
}

export async function getGradeDistribution(
  academicYearId: number | null
): Promise<ServiceResponse<{ grade: string; count: number }[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }
    const gradeDistribution = await prisma.grade.groupBy({
      by: ['grade'],
      _count: {
        grade: true
      },
      where: {
        classSubject: {
          class: {
            semester: {
              academicYearId: academicYearId
            }
          }
        }
      },
      orderBy: {
        grade: 'asc'
      }
    });

    const mappedDistribution = gradeDistribution.map((item) => ({
      grade: item.grade,
      count: item._count.grade
    }));

    return {
      success: true,
      data: mappedDistribution
    };
  } catch (error) {
    console.error('Error fetching grade distribution:', error);
    return {
      success: false,
      error: 'Failed to fetch grade distribution'
    };
  }
}

export async function getStudentStatusDistribution(
  academicYearId: number | null
): Promise<ServiceResponse<{ status: string; count: number }[]>> {
  try {
    if (!academicYearId) {
      return {
        success: false,
        error: 'Academic year not found'
      };
    }
    const statusData = await prisma.academicYearResult.groupBy({
      by: ['status'],
      _count: {
        status: true
      },
      where: {
        academicYearId: academicYearId
      }
    });

    const statusDistribution = statusData.map((item) => ({
      status: item.status,
      count: item._count.status
    }));

    return {
      success: true,
      data: statusDistribution
    };
  } catch (error) {
    console.error('Error fetching student status distribution:', error);
    return {
      success: false,
      error: 'Failed to fetch student status distribution'
    };
  }
}
