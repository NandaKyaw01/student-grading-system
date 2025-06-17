'use server';

import { Prisma, Semester } from '@/generated/prisma';
import { prisma } from '@/lib/db';
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
    revalidateTag(`semester-${newSemester.id}`);
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
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete semester'
    };
  }
}

export async function setCurrentSemester(id: number) {
  try {
    await prisma.$transaction([
      prisma.semester.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      }),
      prisma.semester.update({
        where: { id },
        data: { isCurrent: true }
      })
    ]);

    revalidateTag('semesters');
    return true;
  } catch (error) {
    console.error('Error setting current semester:', error);
    return false;
  }
}

export const getSemesters = unstable_cache(
  async (options?: {
    academicYearId?: number;
    currentOnly?: boolean;
    includeDetails?: boolean;
  }) => {
    try {
      return await prisma.semester.findMany({
        where: {
          academicYearId: options?.academicYearId,
          isCurrent: options?.currentOnly ? true : undefined
        },
        include: options?.includeDetails ? semesterWithDetails : undefined,
        orderBy: { semesterName: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching semesters:', error);
      return [];
    }
  },
  ['semesters'],
  {
    tags: ['semesters'],
    revalidate: 3600 // 1 hour cache
  }
);

export const getSemesterById = async (id: number) => {
  return await unstable_cache(
    async () => {
      try {
        return await prisma.semester.findUnique({
          where: { id },
          include: semesterWithDetails
        });
      } catch (error) {
        console.error(`Error fetching semester ${id}:`, error);
        return null;
      }
    },
    ['semester'],
    {
      tags: [`semester-${id}`]
    }
  )();
};

export async function getSemestersForSelect() {
  return await prisma.semester.findMany({
    select: {
      id: true,
      semesterName: true,
      academicYear: {
        select: {
          yearRange: true
        }
      }
    },
    orderBy: {
      academicYear: {
        yearRange: 'desc'
      }
    }
  });
}
