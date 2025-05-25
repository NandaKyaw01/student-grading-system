import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetAcademicYearSchema } from '@/lib/search-params/class';
import { unstable_cache } from 'next/cache';

export async function getAllClasses(input?: GetAcademicYearSchema) {
  return await unstable_cache(
    async () => {
      try {
        const isPaginated = !!input;
        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const where: Prisma.ClassWhereInput = {};

        // Search
        if (input?.search?.trim()) {
          where.className = {
            contains: input.search.trim(),
            mode: 'insensitive'
          };
        }

        // Academic Year ID
        if (input?.academicYearId && input.academicYearId !== '') {
          const ids = Array.isArray(input.academicYearId)
            ? input.academicYearId
            : input.academicYearId.split(',').filter(Boolean);
          if (ids.length > 0) {
            where.academicYearId = { in: ids };
          }
        }

        const orderBy =
          input?.sort && input.sort.length > 0
            ? input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            : [{ createdAt: 'asc' }];

        const [classes, totalCount] = await Promise.all([
          prisma.class.findMany({
            where,
            include: { academicYear: true },
            orderBy,
            ...(isPaginated && { skip: offset, take: limit })
          }),
          prisma.class.count({ where })
        ]);

        const pageCount = isPaginated ? Math.ceil(totalCount / limit) : 1;

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
