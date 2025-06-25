'use server';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';

const classSubjectWithDetails = Prisma.validator<Prisma.ClassSubjectInclude>()({
  class: true,
  subject: true
});

export type ClassSubjectWithDetails = Prisma.ClassSubjectGetPayload<{
  include: typeof classSubjectWithDetails;
}>;

export async function assignSubjectToClass(data: {
  classId: number;
  subjectId: string;
}) {
  try {
    const classSubject = await prisma.classSubject.create({
      data,
      include: {
        class: true,
        subject: true
      }
    });

    revalidateTag(`class-subjects-${data.classId}`);
    revalidateTag(`available-subjects-${data.classId}`);
    revalidateTag(`classes`);

    return { success: true, data: classSubject };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to assign subject to class'
    };
  }
}

export async function removeSubjectFromClass(data: {
  classId: number;
  subjectId: string;
}) {
  try {
    await prisma.classSubject.delete({
      where: {
        classId_subjectId: {
          classId: data.classId,
          subjectId: data.subjectId
        }
      }
    });
    revalidateTag(`class-subjects-${data.classId}`);
    revalidateTag(`available-subjects-${data.classId}`);
    revalidateTag(`classes`);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove subject from class'
    };
  }
}

export async function getClassSubjects(classId: number) {
  // return await unstable_cache(
  //   async () => {
  try {
    return await prisma.classSubject.findMany({
      where: { classId },
      include: classSubjectWithDetails
    });
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return [];
  }
  //   },
  //   [`class-subjects-${classId}`],
  //   {
  //     tags: [`class-subjects-${classId}`]
  //   }
  // )();
}

export const getAvailableSubjectsForClass = async (classId: number) => {
  // return await unstable_cache(
  //   async () => {
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
  //   },
  //   [`available-subjects-${classId}`],
  //   {
  //     tags: [`available-subjects-${classId}`]
  //   }
  // )();
};
