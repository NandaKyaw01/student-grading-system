import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetAcademicYearSchema } from '@/lib/search-params/class';
import { unstable_cache } from 'next/cache';

export async function getAllAcademicYears(input?: GetAcademicYearSchema) {
  return await unstable_cache(
    async () => {
      try {
        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const where: Prisma.AcademicYearWhereInput = {};

        if (input?.search) {
          where.year = {
            contains: input.search,
            mode: 'insensitive'
          };
        }

        const orderBy = input?.sort
          ? input?.sort?.length > 0
            ? input.sort.map((s) => ({
                [s.id]: s.desc ? 'desc' : 'asc'
              }))
            : [{ year: 'asc' }]
          : [{ year: 'asc' }];

        const [academicYears, totalCount] = await Promise.all([
          prisma.academicYear.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit
          }),
          prisma.academicYear.count({ where })
        ]);

        const pageCount = Math.ceil(totalCount / limit);

        return { academicYears, pageCount };
      } catch (error) {
        console.error('❌ Error fetching academic years:', error);
        return { academicYears: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      revalidate: 1,
      tags: ['academicYears']
    }
  )();
}
