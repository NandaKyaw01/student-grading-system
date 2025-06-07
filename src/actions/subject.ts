'use server';

import { Subject } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function createSubject(
  data: Omit<Subject, 'createdAt' | 'updatedAt'>
) {
  try {
    const newSubject = await prisma.subject.create({
      data
    });

    revalidateTag('subjects');
    revalidateTag(`subject-${newSubject.id}`);
    return { success: true, data: newSubject };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subject'
    };
  }
}

export async function updateSubject(
  id: string,
  data: Partial<Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const updatedSubject = await prisma.subject.update({
      where: { id },
      data
    });

    revalidateTag('subjects');
    revalidateTag(`subject-${id}`);
    return { success: true, data: updatedSubject };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update subject'
    };
  }
}

export async function deleteSubject(id: string) {
  try {
    // Check for dependent records
    const hasDependencies = await prisma.subject.findFirst({
      where: { id },
      include: {
        classes: true,
        grades: true
      }
    });

    if (hasDependencies?.classes.length || hasDependencies?.grades.length) {
      throw new Error('Cannot delete subject with existing classes or grades');
    }

    await prisma.subject.delete({
      where: { id }
    });

    revalidateTag('subjects');
    revalidateTag(`subject-${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete subject'
    };
  }
}
