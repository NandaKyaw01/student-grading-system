'use server';

import { AcademicYear, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetAcademicYearSchema } from '@/lib/search-params/class';
import { revalidateTag, unstable_cache } from 'next/cache';

export async function createAcademicYear(
  data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    // First check if there are any dependent records
    const hasYear = await prisma.academicYear.findUnique({
      where: { yearRange: data.yearRange }
    });

    if (hasYear) {
      throw new Error('Duplicate academic year');
    }
    // If setting as current, first unset any existing current academic year
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academicYear.create({
      data
    });

    revalidateTag('academic-years');

    return { success: true, data: academicYear };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create academic year'
    };
  }
}

export async function updateAcademicYear(
  id: number,
  data: Partial<Omit<AcademicYear, 'id'>>
) {
  try {
    // If setting as current, first unset any existing current academic year
    if (data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const academicYear = await prisma.academicYear.update({
      where: { id },
      data
    });

    revalidateTag('academic-years');
    revalidateTag(`academic-years-${id}`);

    return { success: true, data: academicYear };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update academic year'
    };
  }
}

export async function deleteAcademicYear(id: number) {
  try {
    // First check if there are any dependent records
    const hasDependencies = await prisma.academicYear.findFirst({
      where: { id },
      include: {
        semesters: true
      }
    });

    if (hasDependencies?.semesters.length) {
      throw new Error(
        'Cannot delete academic year with existing semesters or enrollments'
      );
    }

    await prisma.academicYear.delete({
      where: { id }
    });

    revalidateTag('academic-years');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete academic year'
    };
  }
}

export async function setCurrentAcademicYear(id: number) {
  try {
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true }
      })
    ]);

    revalidateTag('academic-years');
    return true;
  } catch (error) {
    console.error('Error setting current academic year:', error);
    return false;
  }
}

export async function getAcademicYears(
  input?: GetAcademicYearSchema,
  options?: { currentOnly?: boolean }
) {
  return await unstable_cache(
    async () => {
      try {
        const where: Prisma.AcademicYearWhereInput = {};
        let paginate = true;
        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          if (input.search?.trim()) {
            where.OR = [
              { id: { equals: parseInt(input.search) || undefined } }
            ];
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

        const [years, totalCount] = await prisma.$transaction([
          prisma.academicYear.findMany({
            where: options?.currentOnly ? { isCurrent: true } : undefined,
            orderBy,
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.academicYear.count({ where })
        ]);
        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;
        // return await prisma.academicYear.findMany({
        //   where: options?.currentOnly ? { isCurrent: true } : undefined
        // });
        return {
          years,
          pageCount
        };
      } catch (error) {
        console.error('Error fetching academic years:', error);
        return {
          years: [],
          pageCount: 0
        };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      tags: ['academic-years'],
      revalidate: 3600 // 1 hour cache
    }
  )();
}

export const getAcademicYearById = async (id: number) => {
  return await unstable_cache(
    async () => {
      try {
        return await prisma.academicYear.findUnique({
          where: { id }
        });
      } catch (error) {
        console.error(`Error fetching academic year ${id}:`, error);
        return null;
      }
    },
    ['academic-year'],
    {
      tags: [`academic-year-${id}`]
    }
  )();
};
