import { Prisma, Student } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetStudentSchema } from '@/lib/search-params/student';
import { unstable_cache } from 'next/cache';

export async function getAllStudents(input?: GetStudentSchema) {
  return await unstable_cache(
    async () => {
      try {
        const where: Prisma.StudentWhereInput = {};
        let paginate = true;

        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          // Search
          if (input.search?.trim()) {
            where.OR = [
              { id: { equals: parseInt(input.search) || undefined } },
              { studentName: { contains: input.search, mode: 'insensitive' } }
              // { rollNumber: { contains: input.search, mode: 'insensitive' } }
            ];
          }

          // Filter by rollNumber if needed
          // if (input.rollNumber) {
          //   where.rollNumber = {
          //     contains: input.rollNumber,
          //     mode: 'insensitive'
          //   };
          // }

          // Filter by name if needed
          if (input.name) {
            where.studentName = { contains: input.name, mode: 'insensitive' };
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
            include: {
              enrollments: {
                include: {
                  class: true,
                  semester: true
                }
              },
              grades: true,
              results: true
            },
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

export async function getStudentById(id: string): Promise<Student | null> {
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
