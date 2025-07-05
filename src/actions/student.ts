'use server';

import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';
import { getErrorMessage } from '@/lib/handle-error';

import { GetStudentSchema } from '@/lib/search-params/student';
import { Prisma, Student } from '@/generated/prisma';

const studentWithDetails = Prisma.validator<Prisma.StudentInclude>()({
  enrollments: true
});

export type StudentwithDetails = Prisma.StudentGetPayload<{
  include: typeof studentWithDetails;
}>;

export async function createStudent(
  input: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const student = await prisma.student.create({
      data: {
        studentName: input.studentName,
        admissionId: input.admissionId
      }
    });

    revalidateTag('students');

    return {
      success: true,
      data: student,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function updateStudent(
  input: Omit<Student, 'createdAt' | 'updatedAt'>
) {
  try {
    const student = await prisma.student.update({
      where: { id: input.id },
      data: {
        studentName: input.studentName,
        admissionId: input.admissionId
      }
    });

    revalidateTag('students');
    revalidateTag(`student-${input.id}`);

    return {
      success: true,
      data: student,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function deleteStudent(id: number) {
  try {
    // First, check if the student exists and has any enrollments or results
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          select: { id: true }
        },
        academicYearResults: {
          select: { id: true }
        }
      }
    });

    if (!student) {
      return {
        data: null,
        error: 'Student not found'
      };
    }

    // Check if student has any enrollments
    if (student.enrollments.length > 0) {
      return {
        data: null,
        error:
          'Cannot delete student with existing enrollments. Please remove all enrollments first.'
      };
    }

    // Check if student has any academic year results
    if (student.academicYearResults.length > 0) {
      return {
        data: null,
        error:
          'Cannot delete student with existing academic results. Please remove all results first.'
      };
    }

    // If no enrollments or results, proceed with deletion
    await prisma.student.delete({
      where: { id }
    });

    revalidateTag('students');

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

export async function deleteStudents(ids: number[]) {
  try {
    if (!ids || ids.length === 0) {
      return {
        data: null,
        error: 'No student IDs provided'
      };
    }

    // Check which students have enrollments or results
    const studentsWithRelations = await prisma.student.findMany({
      where: {
        id: { in: ids }
      },
      select: {
        id: true,
        studentName: true,
        admissionId: true,
        _count: {
          select: {
            enrollments: true,
            academicYearResults: true
          }
        }
      }
    });

    // Filter students that cannot be deleted
    const cannotDelete = studentsWithRelations.filter(
      (student) =>
        student._count.enrollments > 0 || student._count.academicYearResults > 0
    );

    // If any students cannot be deleted, return error
    if (cannotDelete.length > 0) {
      const studentNames = cannotDelete
        .map((s) => `${s.studentName} (${s.admissionId})`)
        .join(', ');

      return {
        data: null,
        error: `Cannot delete ${cannotDelete.length} student(s) with existing enrollments or results: ${studentNames}`
      };
    }

    // Check if all requested students exist
    if (studentsWithRelations.length !== ids.length) {
      const foundIds = studentsWithRelations.map((s) => s.id);
      const notFoundIds = ids.filter((id) => !foundIds.includes(id));

      return {
        data: null,
        error: `Students with IDs ${notFoundIds.join(', ')} not found`
      };
    }

    // If all students can be deleted, proceed
    await prisma.student.deleteMany({
      where: {
        id: { in: ids }
      }
    });

    revalidateTag('students');

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

export async function getAllStudents(
  input?: GetStudentSchema,
  options?: {
    includeDetails?: boolean;
  }
) {
  return await unstable_cache(
    async () => {
      try {
        const where: Prisma.StudentWhereInput = {};
        let paginate = true;
        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          // Search
          if (input.id?.trim()) {
            where.OR = [
              { id: { equals: parseInt(input.id) || undefined } },
              { studentName: { contains: input.id, mode: 'insensitive' } },
              { admissionId: { contains: input.id, mode: 'insensitive' } }
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

        const [students, totalCount] = await prisma.$transaction([
          prisma.student.findMany({
            where,
            include: options?.includeDetails ? studentWithDetails : undefined,
            orderBy,
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.student.count({ where })
        ]);

        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

        return {
          students,
          pageCount
        };
      } catch (error) {
        console.error('❌ Error fetching students:', error);
        return {
          students: [],
          pageCount: 0
        };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      revalidate: 1,
      tags: ['students']
    }
  )();
}

export async function getStudentById(id: string) {
  return await unstable_cache(
    async () => {
      try {
        return await prisma.student.findUnique({
          where: { id: parseInt(id) }
        });
      } catch (error) {
        console.error(`❌ Error fetching student with ID ${id}:`, error);
        return null;
      }
    },
    [`student-${id}`],
    {
      revalidate: 1,
      tags: ['student', `student-${id}`]
    }
  )();
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
