import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetAcademicYearSchema } from '@/lib/search-params/class';
import { unstable_cache } from 'next/cache';

export async function getAllClasses(input?: GetAcademicYearSchema) {
  return await unstable_cache(
    async () => {
      try {
        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const where: Prisma.ClassWhereInput = {};

        if (input?.search) {
          where.className = {
            contains: input.search,
            mode: 'insensitive'
          };
        }

        if (input?.academicYearId) {
          const ids = Array.isArray(input.academicYearId)
            ? input.academicYearId
            : input.academicYearId.split(',');
          where.academicYearId = { in: ids };
        }

        const orderBy = input?.sort
          ? input?.sort?.length > 0
            ? input.sort.map((s) => ({
                [s.id]: s.desc ? 'desc' : 'asc'
              }))
            : [{ createdAt: 'asc' }]
          : [{ createdAt: 'asc' }];

        const [classes, totalCount] = await Promise.all([
          prisma.class.findMany({
            where,
            include: { academicYear: true },
            orderBy,
            skip: offset,
            take: limit
          }),
          prisma.class.count({ where })
        ]);

        const pageCount = Math.ceil(totalCount / limit);

        return { classes, pageCount };
      } catch (error) {
        console.error('❌ Error fetching classes:', error);
        return { classes: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      revalidate: 1,
      tags: ['classes']
    }
  )();
}
