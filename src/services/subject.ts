import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';

const subjectWithDetails = Prisma.validator<Prisma.SubjectInclude>()({
  classes: true,
  grades: true
});

export type SubjectWithDetails = Prisma.SubjectGetPayload<{
  include: typeof subjectWithDetails;
}>;

export const getSubjects = unstable_cache(
  async (options?: { includeDetails?: boolean }) => {
    try {
      return await prisma.subject.findMany({
        include: options?.includeDetails ? subjectWithDetails : undefined
      });
    } catch (error) {
      console.error('Error fetching subjects:', error);
      return [];
    }
  },
  ['subjects'],
  {
    tags: ['subjects'],
    revalidate: 3600
  }
);

export const getSubjectById = (id: string) => {
  return unstable_cache(
    async () => {
      try {
        return await prisma.subject.findUnique({
          where: { id },
          include: subjectWithDetails
        });
      } catch (error) {
        console.error(`Error fetching subject ${id}:`, error);
        return null;
      }
    },
    ['subject'],
    {
      tags: [`subject-${id}`]
    }
  );
};
