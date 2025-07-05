'use server';

import { GradeScale, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetGradeScaleSchema } from '@/lib/search-params/grade-scale';
import { revalidateTag, unstable_cache } from 'next/cache';

export async function getGradeScales(
  input?: GetGradeScaleSchema,
  options?: { useCache?: boolean }
): Promise<{
  gradeScales: GradeScale[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.GradeScaleWhereInput = {};
      let paginate = true;

      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        if (input.minMark?.trim()) {
          const searchAsNumber = parseFloat(input.minMark);
          const isNumericSearch = !isNaN(searchAsNumber);

          where.OR = [
            { grade: { contains: input.minMark, mode: 'insensitive' } },
            // Only include numeric searches for minMark/maxMark/score
            ...(isNumericSearch
              ? [
                  { minMark: { equals: searchAsNumber } },
                  { maxMark: { equals: searchAsNumber } },
                  { score: { equals: searchAsNumber } }
                ]
              : [])
          ];
        }
      }

      const orderBy =
        input?.sort && input.sort.length > 0
          ? input.sort.map((item) => ({
              [item.id]: item.desc ? 'desc' : 'asc'
            }))
          : [{ minMark: 'asc' }];

      const page = input?.page ?? 1;
      const limit = input?.perPage ?? 10;
      const offset = (page - 1) * limit;

      const [gradeScales, totalCount] = await prisma.$transaction([
        prisma.gradeScale.findMany({
          where,
          orderBy,
          ...(paginate ? { skip: offset, take: limit } : {})
        }),
        prisma.gradeScale.count({ where })
      ]);

      const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

      return {
        gradeScales: gradeScales as GradeScale[],
        pageCount
      };
    } catch (error) {
      console.error('Error fetching grade scales:', error);
      return {
        gradeScales: [] as GradeScale[],
        pageCount: 0
      };
    }
  };

  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [JSON.stringify(input ?? {}) + JSON.stringify(options ?? {})],
      {
        tags: ['grade-scales'],
        revalidate: 3600 // 1 hour cache
      }
    )();
  }
  return await queryFunction();
}

export async function createGradeScale(
  data: Omit<GradeScale, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    // Validate mark range doesn't overlap with existing scales
    const overlappingScale = await prisma.gradeScale.findFirst({
      where: {
        OR: [
          { minMark: { lte: data.maxMark, gte: data.minMark } },
          { maxMark: { lte: data.maxMark, gte: data.minMark } },
          {
            AND: [
              { minMark: { lte: data.minMark } },
              { maxMark: { gte: data.maxMark } }
            ]
          }
        ]
      }
    });

    if (overlappingScale) {
      return {
        success: false,
        error: 'Mark range overlaps with existing grade scale'
      };
    }

    const gradeScale = await prisma.gradeScale.create({
      data
    });

    revalidateTag('grade-scales');

    return { success: true, gradeScale };
  } catch (error) {
    // console.error('Error creating grade scale:', error);
    return { success: false, error: 'Failed to create grade scale' };
  }
}

export async function updateGradeScale(
  id: number,
  data: Partial<Omit<GradeScale, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    // Validate mark range doesn't overlap with other scales
    const overlappingScale = await prisma.gradeScale.findFirst({
      where: {
        id: { not: id },
        OR: [
          { minMark: { lte: data.maxMark, gte: data.minMark } },
          { maxMark: { lte: data.maxMark, gte: data.minMark } },
          {
            AND: [
              { minMark: { lte: data.minMark } },
              { maxMark: { gte: data.maxMark } }
            ]
          }
        ]
      }
    });

    if (overlappingScale) {
      return {
        success: false,
        error: 'Mark range overlaps with another grade scale'
      };
    }

    const gradeScale = await prisma.gradeScale.update({
      where: { id },
      data
    });
    revalidateTag('grade-scales');
    return { success: true, gradeScale };
  } catch (error) {
    console.error('Error updating grade scale:', error);
    return { success: false, error: 'Failed to update grade scale' };
  }
}

export async function deleteGradeScale(id: number) {
  try {
    await prisma.gradeScale.delete({
      where: { id }
    });

    revalidateTag('grade-scales');
    return { success: true };
  } catch (error) {
    console.error('Error deleting grade scale:', error);
    return { success: false, error: 'Failed to delete grade scale' };
  }
}

export async function deleteGradeScales(ids: number[]) {
  try {
    await prisma.gradeScale.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    revalidateTag('grade-scales');

    return { success: true };
  } catch (err) {
    console.error('Error deleting grade scale:', err);
    return { success: false, error: 'Failed to delete grade scales' };
  }
}
