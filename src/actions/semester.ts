'use server';

import { Prisma, Semester } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetSemesterSchema } from '@/lib/search-params/semester';
import { revalidateTag, unstable_cache } from 'next/cache';

const semesterWithDetails = Prisma.validator<Prisma.SemesterInclude>()({
  academicYear: true,
  classes: true,
  enrollments: true
});

export type SemesterWithDetails = Prisma.SemesterGetPayload<{
  include: typeof semesterWithDetails;
}>;

export async function createSemester(
  data: Omit<Semester, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    // First check if there are any dependent records
    const hasSemester = await prisma.semester.findFirst({
      where: {
        academicYearId: data.academicYearId,
        semesterName: data.semesterName
      }
    });

    if (hasSemester) {
      throw new Error('Duplicate semester');
    }

    // If setting as current, first unset any existing current semester
    if (data.isCurrent) {
      await prisma.semester.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const newSemester = await prisma.semester.create({
      data
    });

    revalidateTag('semesters');
    revalidateTag('academic-years');

    return { success: true, data: newSemester };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create semester'
    };
  }
}

export async function updateSemester(
  id: number,
  data: Partial<Omit<Semester, 'id'>>
) {
  try {
    // If setting as current, first unset any existing current semester
    if (data.isCurrent) {
      await prisma.semester.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      });
    }

    const updatedSemester = await prisma.semester.update({
      where: { id },
      data
    });

    revalidateTag('semesters');
    revalidateTag(`semester-${id}`);
    revalidateTag('academic-years');

    return { success: true, data: updatedSemester };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to update semester'
    };
  }
}

export async function deleteSemester(id: number) {
  try {
    // Check for dependent records
    const hasDependencies = await prisma.semester.findFirst({
      where: { id },
      include: {
        classes: true,
        enrollments: true
      }
    });

    if (
      hasDependencies?.classes.length ||
      hasDependencies?.enrollments.length
    ) {
      throw new Error('Cannot delete semester with existing related records');
    }

    await prisma.semester.delete({
      where: { id }
    });

    revalidateTag('semesters');
    revalidateTag(`semester-${id}`);
    revalidateTag('academic-years');

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete semester'
    };
  }
}

export async function getSemesters<T extends boolean = false>(
  input?: GetSemesterSchema,
  options?: {
    academicYearId?: number[];
    currentOnly?: boolean;
    includeDetails?: T;
    useCache?: boolean;
  }
): Promise<{
  semesters: T extends true ? SemesterWithDetails[] : Semester[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.SemesterWhereInput = {};
      let paginate = true;

      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        if (input.search?.trim()) {
          where.OR = [
            {
              academicYear: {
                yearRange: { contains: input.search, mode: 'insensitive' }
              }
            },
            {
              semesterName: { contains: input.search, mode: 'insensitive' }
            }
          ];
        }

        if (input.isCurrent) {
          where.isCurrent = input.isCurrent == 'true' ? true : false;
        }

        if (input?.academicYearId && input?.academicYearId?.length > 0) {
          where.academicYearId = { in: input.academicYearId };
        }
      }

      if (options?.academicYearId && options?.academicYearId?.length > 0) {
        where.academicYearId = { in: options?.academicYearId };
      }

      const orderBy: Prisma.SemesterOrderByWithRelationInput[] = [
        ...(input?.sort && input.sort.length > 0
          ? [
              {
                academicYear: {
                  yearRange: (input.sort[0].desc
                    ? 'desc'
                    : 'asc') as Prisma.SortOrder
                }
              }
            ]
          : [
              {
                academicYear: {
                  yearRange: 'asc' as Prisma.SortOrder
                }
              }
            ]),
        { id: 'asc' }
      ];

      const page = input?.page ?? 1;
      const limit = input?.perPage ?? 10;
      const offset = (page - 1) * limit;

      const [semester, totalCount] = await prisma.$transaction([
        prisma.semester.findMany({
          where: {
            isCurrent: options?.currentOnly ? true : undefined,
            ...where
          },
          include: options?.includeDetails ? semesterWithDetails : undefined,
          orderBy,
          ...(paginate ? { skip: offset, take: limit } : {})
        }),
        prisma.semester.count({ where })
      ]);

      const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

      return {
        semesters: semester as T extends true
          ? SemesterWithDetails[]
          : Semester[],
        pageCount
      };
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return {
        semesters: [] as unknown as T extends true
          ? SemesterWithDetails[]
          : Semester[],
        pageCount: 0
      };
    }
  };

  // Use cache by default (explicitly disable with useCache: false)
  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [JSON.stringify(input ?? {}) + JSON.stringify(options ?? {})],
      {
        tags: ['semesters'],
        revalidate: 3600 // 1 hour cache
      }
    )();
  }

  // Execute directly without cache
  return await queryFunction();
}
