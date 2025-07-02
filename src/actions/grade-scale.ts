'use server';

import { GradeScale } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { revalidateTag, unstable_cache } from 'next/cache';

export async function getAllGradeScales(useCache?: boolean) {
  const queryFunction = async () =>
    await prisma.gradeScale.findMany({
      orderBy: {
        minMark: 'asc'
      }
    });

  if (useCache !== false) {
    return await unstable_cache(queryFunction, [`grade-scales`], {
      tags: ['grade-scales'],
      revalidate: 3600 // 1 hour cache
    })();
  }
  return await queryFunction();
}

export async function getGradeScaleById(id: number) {
  return await prisma.gradeScale.findUnique({
    where: { id }
  });
}

export async function createGradeScale(
  data: Omit<GradeScale, 'id' | 'createdAt' | 'updatedAt'>
) {
  try {
    // Validate mark range doesn't overlap with existing scales
    const overlappingScale = await prisma.gradeScale.findFirst({
      where: {
        OR: [
          { minMark: { lte: data.maxMark, gte: data.minMark } },
          { maxMark: { lte: data.maxMark, gte: data.minMark } },
          {
            AND: [
              { minMark: { lte: data.minMark } },
              { maxMark: { gte: data.maxMark } }
            ]
          }
        ]
      }
    });

    if (overlappingScale) {
      return {
        success: false,
        error: 'Mark range overlaps with existing grade scale'
      };
    }

    const gradeScale = await prisma.gradeScale.create({
      data
    });

    revalidateTag('grade-scales');

    return { success: true, gradeScale };
  } catch (error) {
    // console.error('Error creating grade scale:', error);
    return { success: false, error: 'Failed to create grade scale' };
  }
}

export async function updateGradeScale(
  id: number,
  data: Partial<Omit<GradeScale, 'id' | 'createdAt' | 'updatedAt'>>
) {
  try {
    // Validate mark range doesn't overlap with other scales
    const overlappingScale = await prisma.gradeScale.findFirst({
      where: {
        id: { not: id },
        OR: [
          { minMark: { lte: data.maxMark, gte: data.minMark } },
          { maxMark: { lte: data.maxMark, gte: data.minMark } },
          {
            AND: [
              { minMark: { lte: data.minMark } },
              { maxMark: { gte: data.maxMark } }
            ]
          }
        ]
      }
    });

    if (overlappingScale) {
      return {
        success: false,
        error: 'Mark range overlaps with another grade scale'
      };
    }

    const gradeScale = await prisma.gradeScale.update({
      where: { id },
      data
    });
    revalidateTag('grade-scales');
    return { success: true, gradeScale };
  } catch (error) {
    console.error('Error updating grade scale:', error);
    return { success: false, error: 'Failed to update grade scale' };
  }
}

export async function deleteGradeScale(id: number) {
  try {
    await prisma.gradeScale.delete({
      where: { id }
    });

    revalidateTag('grade-scales');
    return { success: true };
  } catch (error) {
    console.error('Error deleting grade scale:', error);
    return { success: false, error: 'Failed to delete grade scale' };
  }
}
