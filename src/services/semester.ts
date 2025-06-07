import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';

const semesterWithDetails = Prisma.validator<Prisma.SemesterInclude>()({
  academicYear: true,
  classes: {
    include: {
      subjects: true
    }
  },
  enrollments: {
    include: {
      student: true,
      class: true
    }
  }
});

export type SemesterWithDetails = Prisma.SemesterGetPayload<{
  include: typeof semesterWithDetails;
}>;

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

export const getSemesterById = (id: number) => {
  return unstable_cache(
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
  );
};
