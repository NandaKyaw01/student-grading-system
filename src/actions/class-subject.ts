'use server';

import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

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

    revalidateTag('class-subjects');
    revalidateTag(`class-${data.classId}-subjects`);
    revalidateTag(`class-${data.classId}-available-subjects`);
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

    revalidateTag('class-subjects');
    revalidateTag(`class-${data.classId}-subjects`);
    revalidateTag(`class-${data.classId}-available-subjects`);
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

export async function revalidateClassSubjects(classId: number) {
  // revalidateTag(`class-${classId}-subjects`);
  // revalidateTag(`class-${classId}-available-subjects`);
  revalidateTag(`available-subjects`);
  revalidateTag(`class-subjects`);
}
