'use server';

import { Input } from '@/components/ui/input';
import { Class, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetClassSchema } from '@/lib/search-params/class';
import { revalidateTag, unstable_cache } from 'next/cache';

const classWithDetails = Prisma.validator<Prisma.ClassInclude>()({
  semester: {
    include: {
      academicYear: true
    }
  },
  subjects: true,
  enrollments: {
    include: {
      student: true
    }
  }
});

export type ClassWithDetails = Prisma.ClassGetPayload<{
  include: typeof classWithDetails;
}>;

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

export async function getClasses(
  input?: GetClassSchema,
  options?: { semesterId?: number; includeDetails?: boolean }
) {
  return await unstable_cache(
    async () => {
      try {
        const where: Prisma.ClassWhereInput = {};
        let paginate = true;
        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          if (input.search?.trim()) {
            where.OR = [
              { id: { equals: parseInt(input.search) || undefined } }
            ];
          }
        }
        const orderBy =
          input?.sort && input.sort.length > 0
            ? input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            : [{ createdAt: 'desc' }];
        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;
        const [classlist, totalCount] = await prisma.$transaction([
          prisma.class.findMany({
            where: {
              semesterId: options?.semesterId
            },
            include: options?.includeDetails ? classWithDetails : undefined,
            orderBy,
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.class.count({ where })
        ]);
        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;
        const typedClass = classlist as ClassWithDetails[];
        return {
          classes: typedClass,
          pageCount
        };
      } catch (error) {
        console.error('Error fetching classes:', error);
        return {
          classes: [],
          pageCount: 0
        };
      }
    },
    [JSON.stringify(input ?? {})],
    {
      tags: ['classes'],
      revalidate: 3600
    }
  )();
}

export const getClassById = async (id: number) => {
  return await unstable_cache(
    async () => {
      try {
        return await prisma.class.findUnique({
          where: { id },
          include: classWithDetails
        });
      } catch (error) {
        console.error(`Error fetching class ${id}:`, error);
        return null;
      }
    },
    ['class'],
    {
      tags: [`class-${id}`]
    }
  )();
};
