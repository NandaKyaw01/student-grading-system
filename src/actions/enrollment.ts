'use server';
import { Enrollment, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetEnrollmentSchema } from '@/lib/search-params/enrollment';
import { revalidateTag, unstable_cache } from 'next/cache';

const enrollmentWithDetails = Prisma.validator<Prisma.EnrollmentInclude>()({
  student: true,
  class: true,
  semester: {
    include: {
      academicYear: true
    }
  }
});

export type EnrollmentWithDetails = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentWithDetails;
}>;
export async function getAllEnrollments<T extends boolean = false>(
  input?: GetEnrollmentSchema,
  options?: {
    includeDetails?: T;
    useCache?: boolean;
  }
): Promise<{
  enrollments: T extends true ? EnrollmentWithDetails[] : Enrollment[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.EnrollmentWhereInput = {};
      let paginate = true;

      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        // Search
        if (input.search?.trim()) {
          where.OR = [
            { rollNumber: { contains: input.search, mode: 'insensitive' } },
            {
              student: {
                studentName: { contains: input.search, mode: 'insensitive' }
              }
            }
          ];
        }

        if (input?.academicYearId && input?.academicYearId?.length > 0) {
          where.semester = {
            academicYearId: {
              in: input.academicYearId
            }
          };
        }

        if (input?.semesterId && input?.semesterId?.length > 0) {
          where.semesterId = {
            in: input.semesterId
          };
        }

        if (input?.classId && input?.classId?.length > 0) {
          where.classId = {
            in: input.classId
          };
        }

        if (input?.departmentCode && input?.departmentCode?.length > 0) {
          where.class = {
            departmentCode: {
              in: input.departmentCode
            }
          };
        }

        // Status filter
        // if (input.isActive) {
        //   where.isActive = input.isActive;
        // }

        // Date range
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
          ? input.sort.map((item) => ({
              [item.id]: item.desc ? 'desc' : 'asc'
            }))
          : [{ id: 'desc' }];

      const page = input?.page ?? 1;
      const limit = input?.perPage ?? 10;
      const offset = (page - 1) * limit;

      const [enrollments, totalCount] = await prisma.$transaction([
        prisma.enrollment.findMany({
          where,
          include: options?.includeDetails ? enrollmentWithDetails : undefined,
          orderBy,
          ...(paginate ? { skip: offset, take: limit } : {})
        }),
        prisma.enrollment.count({ where })
      ]);

      const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

      return {
        enrollments: enrollments as T extends true
          ? EnrollmentWithDetails[]
          : Enrollment[],
        pageCount
      };
    } catch (error) {
      console.error('❌ Error fetching enrollments:', error);
      return {
        enrollments: [] as unknown as T extends true
          ? EnrollmentWithDetails[]
          : Enrollment[],
        pageCount: 0
      };
    }
  };

  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [JSON.stringify(input ?? {}) + JSON.stringify(options ?? {})],
      {
        revalidate: 3600,
        tags: ['enrollments']
      }
    )();
  }

  return await queryFunction();
}

export async function getEnrollmentById(id: number) {
  return await prisma.enrollment.findUnique({
    where: { id },
    include: enrollmentWithDetails
  });
}

export async function createEnrollment(
  data: Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: data.studentId,
        // classId: data.classId,
        semesterId: data.semesterId
      }
    });

    if (existingEnrollment) {
      return {
        success: false,
        error:
          'This student is already enrolled in this class for the selected semester'
      };
    }

    const enrollment = await prisma.enrollment.create({
      data
    });
    revalidateTag('enrollments');
    return { success: true, enrollment };
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return { success: false, error: 'Failed to create enrollment' };
  }
}

export async function updateEnrollment(
  id: number,
  data: Partial<Omit<Enrollment, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    if (data.semesterId || data.studentId) {
      // Get current enrollment data
      const currentEnrollment = await prisma.enrollment.findUnique({
        where: { id },
        include: { student: true }
      });

      if (!currentEnrollment) {
        return { success: false, error: 'Enrollment not found' };
      }

      // Use updated values or fall back to current values
      const checkStudentId = data.studentId || currentEnrollment.studentId;
      const checkSemesterId = data.semesterId || currentEnrollment.semesterId;

      // Check if student is already enrolled in any other class for this semester
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: checkStudentId,
          semesterId: checkSemesterId,
          id: { not: id }, // Exclude current enrollment
          classId: { not: currentEnrollment.classId } // Exclude same class
        },
        include: {
          class: true,
          student: true
        }
      });

      if (existingEnrollment) {
        return {
          success: false,
          error: `Student is already enrolled in class "${existingEnrollment.class.className}" for this semester`
        };
      }
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data
    });
    revalidateTag('enrollments');
    return { success: true, enrollment };
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return { success: false, error: 'Failed to update enrollment' };
  }
}

export async function updateEnrollmentStatus(ids: number[], isActive: boolean) {
  try {
    await prisma.enrollment.updateMany({
      where: { id: { in: ids } },
      data: { isActive }
    });
    revalidateTag('enrollments');
    return { success: true };
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    return { success: false, error: 'Failed to update enrollment status' };
  }
}

export async function deleteEnrollment(id: number) {
  try {
    await prisma.enrollment.delete({
      where: { id }
    });
    revalidateTag('enrollments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return { success: false, error: 'Failed to delete enrollment' };
  }
}

export async function deleteEnrollments(ids: number[]) {
  try {
    await prisma.enrollment.deleteMany({
      where: { id: { in: ids } }
    });
    revalidateTag('enrollments');
    return { success: true };
  } catch (error) {
    console.error('Error deleting enrollments:', error);
    return { success: false, error: 'Failed to delete enrollments' };
  }
}

export async function getClassesForSelect() {
  return await prisma.class.findMany({
    select: {
      id: true,
      className: true,
      semesterId: true
    },
    orderBy: {
      className: 'asc'
    }
  });
}

export async function getStudentsForSelect() {
  return await prisma.student.findMany({
    select: {
      id: true,
      studentName: true
    },
    orderBy: {
      studentName: 'asc'
    }
  });
}

export async function getSemestersForSelect() {
  return await prisma.semester.findMany({
    select: {
      id: true,
      semesterName: true,
      academicYear: {
        select: {
          yearRange: true
        }
      }
    },
    orderBy: {
      academicYear: {
        yearRange: 'desc'
      }
    }
  });
}
