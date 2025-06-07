import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';

const classWithDetails = Prisma.validator<Prisma.ClassInclude>()({
  semester: {
    include: {
      academicYear: true
    }
  },
  subjects: true,
  enrollments: {
    include: {
      student: true
    }
  }
});

export type ClassWithDetails = Prisma.ClassGetPayload<{
  include: typeof classWithDetails;
}>;

export const getClasses = unstable_cache(
  async (options?: { semesterId?: number; includeDetails?: boolean }) => {
    try {
      return await prisma.class.findMany({
        where: {
          semesterId: options?.semesterId
        },
        include: options?.includeDetails ? classWithDetails : undefined,
        orderBy: { className: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
  },
  ['classes'],
  {
    tags: ['classes'],
    revalidate: 3600
  }
);

export const getClassById = (id: number) => {
  return unstable_cache(
    async () => {
      try {
        return await prisma.class.findUnique({
          where: { id },
          include: classWithDetails
        });
      } catch (error) {
        console.error(`Error fetching class ${id}:`, error);
        return null;
      }
    },
    ['class'],
    {
      tags: [`class-${id}`]
    }
  );
};
