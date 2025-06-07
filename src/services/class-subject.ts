import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { unstable_cache } from 'next/cache';

const classSubjectWithDetails = Prisma.validator<Prisma.ClassSubjectInclude>()({
  class: true,
  subject: true
});

export type ClassSubjectWithDetails = Prisma.ClassSubjectGetPayload<{
  include: typeof classSubjectWithDetails;
}>;

export async function getClassSubjects(classId: number) {
  return await unstable_cache(
    async () => {
      try {
        return await prisma.classSubject.findMany({
          where: { classId },
          include: classSubjectWithDetails
        });
      } catch (error) {
        console.error('Error fetching class subjects:', error);
        return [];
      }
    },
    ['class-subjects'],
    {
      tags: [`class-${classId}-subjects`]
    }
  )();
}

export const getAvailableSubjectsForClass = async (classId: number) => {
  return await unstable_cache(
    async () => {
      try {
        const assignedSubjects = await prisma.classSubject.findMany({
          where: { classId },
          select: { subjectId: true }
        });

        const assignedSubjectIds = assignedSubjects.map((s) => s.subjectId);

        return await prisma.subject.findMany({
          where: {
            id: {
              notIn: assignedSubjectIds
            }
          }
        });
      } catch (error) {
        console.error('Error fetching available subjects:', error);
        return [];
      }
    },
    ['available-subjects'],
    {
      tags: [`class-${classId}-available-subjects`]
    }
  )();
};
