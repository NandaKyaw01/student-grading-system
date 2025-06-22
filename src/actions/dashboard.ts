'use server';

import { prisma } from '@/lib/db';
import { delay } from '@/lib/utils';

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

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      totalStudents,
      totalClasses,
      totalSubjects,
      currentSemester,
      currentAcademicYear
    ] = await Promise.all([
      prisma.enrollment.count({
        where: {
          isActive: true
        }
      }),
      prisma.class.count({
        where: {
          semester: {
            isCurrent: true
          }
        }
      }),
      prisma.classSubject.count({
        where: {
          class: {
            semester: {
              isCurrent: true
            }
          }
        }
      }),
      prisma.semester.findFirst({
        where: { isCurrent: true },
        select: { semesterName: true }
      }),
      prisma.academicYear.findFirst({
        where: { isCurrent: true },
        select: { yearRange: true }
      })
    ]);

    return {
      totalStudents,
      totalClasses,
      totalSubjects,
      currentSemester: currentSemester?.semesterName || 'N/A',
      currentAcademicYear: currentAcademicYear?.yearRange || 'N/A'
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard statistics');
  }
}

export async function getClassesWithEnrollments(): Promise<
  ClassWithEnrollments[]
> {
  try {
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
          isCurrent: true
        }
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return classes.map((cls) => ({
      ...cls,
      departmentCode: cls.departmentCode as string
    }));
  } catch (error) {
    console.error('Error fetching classes with enrollments:', error);
    throw new Error('Failed to fetch classes data');
  }
}

export async function getTopPerformingStudents(): Promise<
  TopPerformingStudent[]
> {
  try {
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
          isActive: true
        }
      },
      orderBy: {
        gpa: 'desc'
      },
      take: 10
    });

    return topStudents.map((result) => ({
      id: result.enrollment.student.id,
      studentName: result.enrollment.student.studentName,
      admissionId: result.enrollment.student.admissionId,
      gpa: result.gpa,
      className: result.enrollment.class.className,
      departmentCode: result.enrollment.class.departmentCode as string
    }));
  } catch (error) {
    console.error('Error fetching top performing students:', error);
    throw new Error('Failed to fetch top performing students');
  }
}

export async function getRecentEnrollments(): Promise<RecentEnrollment[]> {
  try {
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    return recentEnrollments.map((enrollment) => ({
      ...enrollment,
      class: {
        ...enrollment.class,
        departmentCode: enrollment.class.departmentCode as string
      }
    }));
  } catch (error) {
    console.error('Error fetching recent enrollments:', error);
    throw new Error('Failed to fetch recent enrollments');
  }
}

export async function getSubjectPerformance(): Promise<SubjectPerformance[]> {
  try {
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
      }
    });

    return subjectPerformance
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
  } catch (error) {
    console.error('Error fetching subject performance:', error);
    throw new Error('Failed to fetch subject performance');
  }
}

export async function getSemesterData(): Promise<SemesterData[]> {
  try {
    const semesters = await prisma.semester.findMany({
      select: {
        id: true,
        semesterName: true,
        isCurrent: true,
        _count: {
          select: {
            enrollments: true,
            classes: true
          }
        },
        academicYear: {
          select: {
            yearRange: true
          }
        }
      },
      orderBy: [
        { academicYear: { yearRange: 'desc' } },
        { semesterName: 'asc' }
      ]
    });

    return semesters;
  } catch (error) {
    console.error('Error fetching semester data:', error);
    throw new Error('Failed to fetch semester data');
  }
}

export async function getGradeDistribution() {
  try {
    const gradeDistribution = await prisma.grade.groupBy({
      by: ['grade'],
      _count: {
        grade: true
      },
      orderBy: {
        grade: 'asc'
      }
    });

    return gradeDistribution.map((item) => ({
      grade: item.grade,
      count: item._count.grade
    }));
  } catch (error) {
    console.error('Error fetching grade distribution:', error);
    throw new Error('Failed to fetch grade distribution');
  }
}

export async function getDepartmentDistribution() {
  try {
    // Simpler approach: Include enrollments and count them
    const classes = await prisma.class.findMany({
      select: {
        departmentCode: true,
        enrollments: {
          where: {
            isActive: true
          }
        }
      }
    });

    // Group by department code and count enrollments
    const departmentMap = new Map<string, number>();

    classes.forEach((classData) => {
      const dept = classData.departmentCode;
      const enrollmentCount = classData.enrollments.length;
      const currentCount = departmentMap.get(dept) || 0;
      departmentMap.set(dept, currentCount + enrollmentCount);
    });

    // Convert map to array format
    return Array.from(departmentMap.entries()).map(([department, count]) => ({
      department,
      count
    }));
  } catch (error) {
    console.error('Error fetching department distribution:', error);
    throw new Error('Failed to fetch department distribution');
  }
}
