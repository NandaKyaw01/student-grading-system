'use server';

import { Class } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function createClass(
  data: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    const newClass = await prisma.class.create({
      data: {
        className: data.className,
        departmentCode: data.departmentCode,
        semesterId: data.semesterId
      }
    });

    revalidateTag('classes');
    revalidateTag(`class-${newClass.id}`);
    return { success: true, data: newClass };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create class'
    };
  }
}

export async function updateClass(
  id: number,
  data: Partial<Omit<Class, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    const updatedClass = await prisma.class.update({
      where: { id },
      data
    });

    revalidateTag('classes');
    revalidateTag(`class-${id}`);
    return { success: true, data: updatedClass };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update class'
    };
  }
}

export async function deleteClass(id: number) {
  try {
    // Check for dependent records
    const hasDependencies = await prisma.class.findFirst({
      where: { id },
      include: {
        subjects: true,
        enrollments: true
      }
    });

    if (
      hasDependencies?.subjects.length ||
      hasDependencies?.enrollments.length
    ) {
      throw new Error(
        'Cannot delete class with existing subjects or enrollments'
      );
    }

    await prisma.class.delete({
      where: { id }
    });

    revalidateTag('classes');
    revalidateTag(`class-${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete class'
    };
  }
}
