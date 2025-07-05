'use server';

import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

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

    // revalidateTag(`classes`);

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
    // First check if the ClassSubject exists
    const classSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId: data.classId,
          subjectId: data.subjectId
        }
      },
      include: {
        grades: true
      }
    });

    if (!classSubject) {
      return {
        success: false,
        error: 'Subject is not assigned to this class'
      };
    }

    // Check if there are any grades associated with this class-subject combination
    if (classSubject.grades.length > 0) {
      return {
        success: false,
        error: `Cannot remove subject from class. There are ${classSubject.grades.length} grade(s) associated with this subject in the class. Please remove all grades first.`
      };
    }

    // If no grades exist, proceed with deletion
    await prisma.classSubject.delete({
      where: {
        classId_subjectId: {
          classId: data.classId,
          subjectId: data.subjectId
        }
      }
    });

    // revalidateTag(`classes`);

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
  try {
    const result = await prisma.classSubject.findMany({
      where: { classId },
      include: classSubjectWithDetails
    });

    return {
      success: true,
      data: result,
      error: null
    };
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove subject from class'
    };
  }
}

export const getAvailableSubjectsForClass = async (classId: number) => {
  try {
    const assignedSubjects = await prisma.classSubject.findMany({
      where: { classId },
      select: { subjectId: true }
    });

    const assignedSubjectIds = assignedSubjects.map((s) => s.subjectId);

    const result = await prisma.subject.findMany({
      where: {
        id: {
          notIn: assignedSubjectIds
        }
      }
    });

    return {
      success: true,
      data: result,
      error: null
    };
  } catch (error) {
    console.error('Error fetching available subjects:', error);
    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : 'Failed to remove subject from class'
    };
  }
};

export async function revalidateClassSubjects() {
  revalidateTag('classes');
}
