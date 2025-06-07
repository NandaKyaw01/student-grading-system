// lib/academic-year.ts

import { prisma } from '@/lib/db';
import { unstable_cache } from 'next/cache';

export const getAcademicYears = unstable_cache(
  async (options?: { currentOnly?: boolean }) => {
    try {
      return await prisma.academicYear.findMany({
        where: options?.currentOnly ? { isCurrent: true } : undefined
      });
    } catch (error) {
      console.error('Error fetching academic years:', error);
      return [];
    }
  },
  ['academic-years'],
  {
    tags: ['academic-years'],
    revalidate: 3600 // 1 hour cache
  }
);

export function getAcademicYearById(id: number) {
  return unstable_cache(
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
  );
}
