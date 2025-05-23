import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetStudentSchema } from '@/lib/search-params/student';
import { UpdateStudentInput } from '@/lib/zod-schemas/student-schema';
import { Student } from '@/types/prisma';
import { unstable_cache } from 'next/cache';

export async function getAllStudents(input: GetStudentSchema) {
  return await unstable_cache(
    async () => {
      try {
        const page = input.page ?? 1;
        const limit = input.perPage ?? 10;
        const offset = (page - 1) * limit;

        const where: Prisma.StudentWhereInput = {};

        if (input.search) {
          where.OR = [
            { id: { contains: input.search, mode: 'insensitive' } },
            { name: { contains: input.search, mode: 'insensitive' } },
            { rollNumber: { contains: input.search, mode: 'insensitive' } }
          ];
        }

        if (input.academicYearId) {
          const academicYearIds = Array.isArray(input.academicYearId)
            ? input.academicYearId
            : input.academicYearId.split(',');
          where.academicYearId = { in: academicYearIds };
        }

        if (input.classId) {
          const classIds = Array.isArray(input.classId)
            ? input.classId
            : input.classId.split(',');
          where.classId = { in: classIds };
        }

        if (input.createdAt) {
          const [from, to] = input.createdAt
            .split(',')
            .map((ts) => new Date(Number(ts)));

          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            where.createdAt = {
              gte: from,
              lte: to
            };
          }
        }

        const orderBy =
          input.sort && input.sort.length > 0
            ? input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            : [{ createdAt: 'desc' }];

        const [students, totalCount] = await Promise.all([
          prisma.student.findMany({
            where,
            include: {
              class: true,
              academicYear: true
            },
            orderBy,
            skip: offset,
            take: limit
          }),
          prisma.student.count({ where })
        ]);
        const pageCount = Math.ceil(totalCount / input.perPage);

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
    [JSON.stringify(input)],
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
          where: { id },
          include: {
            class: true,
            academicYear: true
          }
        });
      } catch (error) {
        console.error(`❌ Error fetching student with ID ${id}:`, error);
        return null;
      }
    },
    [`student-${id}`], // cache key
    {
      revalidate: 1,
      tags: ['student', `student-${id}`]
    }
  )();
}
