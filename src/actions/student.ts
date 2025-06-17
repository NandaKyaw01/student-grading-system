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
        studentName: input.studentName
      }
    });

    revalidateTag('students');

    return {
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
        studentName: input.studentName
      }
    });

    revalidateTag('students');
    revalidateTag(`student-${input.id}`);

    return {
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
    await prisma.student.deleteMany({
      where: {
        id: {
          in: ids
        }
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
              { studentName: { contains: input.id, mode: 'insensitive' } }
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
