'use server';

import { AcademicYear } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag } from 'next/cache';

export async function createAcademicYear(
  data: Omit<AcademicYear, 'id' | 'createdAt' | 'updatedAt'>
) {
  // If setting as current, first unset any existing current academic year
  if (data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false }
    });
  }

  const academicYear = await prisma.academicYear.create({
    data
  });

  revalidateTag('academic-years');
  revalidateTag(`academic-years-${academicYear.id}`);
  return academicYear;
}

export async function updateAcademicYear(
  id: number,
  data: Partial<Omit<AcademicYear, 'id'>>
) {
  // If setting as current, first unset any existing current academic year
  if (data.isCurrent) {
    await prisma.academicYear.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false }
    });
  }

  const academicYear = await prisma.academicYear.update({
    where: { id },
    data
  });

  revalidateTag('academic-years');
  revalidateTag(`academic-years-${academicYear.id}`);
  return academicYear;
}

export async function deleteAcademicYear(id: number) {
  try {
    // First check if there are any dependent records
    const hasDependencies = await prisma.academicYear.findFirst({
      where: { id },
      include: {
        semesters: true
      }
    });

    if (hasDependencies?.semesters.length) {
      throw new Error(
        'Cannot delete academic year with existing semesters or enrollments'
      );
    }

    await prisma.academicYear.delete({
      where: { id }
    });

    revalidateTag('academic-years');
    revalidateTag(`academic-years-${id}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to delete academic year'
    };
  }
}

export async function setCurrentAcademicYear(id: number) {
  try {
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { isCurrent: true },
        data: { isCurrent: false }
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isCurrent: true }
      })
    ]);

    revalidateTag('academic-years');
    return true;
  } catch (error) {
    console.error('Error setting current academic year:', error);
    return false;
  }
}
