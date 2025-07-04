'use server';

import { Prisma, Subject } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { GetSubjectSchema } from '@/lib/search-params/subject';
import { revalidateTag, unstable_cache } from 'next/cache';

const subjectWithDetails = Prisma.validator<Prisma.SubjectInclude>()({
  classes: true
});

export type SubjectWithDetails = Prisma.SubjectGetPayload<{
  include: typeof subjectWithDetails;
}>;

export async function createSubject(
  data: Omit<Subject, 'createdAt' | 'updatedAt'>
) {
  try {
    const subject = await prisma.subject.findFirst({
      where: {
        id: data.id
      }
    });

    if (subject)
      return {
        success: false,
        error: 'There is an existing subject with given subject code.'
      };

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
        classes: true
      }
    });

    if (hasDependencies?.classes.length) {
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

export async function getSubjects<T extends boolean = false>(
  input?: GetSubjectSchema,
  options?: { includeDetails?: boolean; useCache?: boolean }
): Promise<{
  subjects: T extends true ? SubjectWithDetails[] : Subject[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.SubjectWhereInput = {};
      let paginate = true;
      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        if (input.search?.trim()) {
          where.OR = [
            { id: { contains: input.search, mode: 'insensitive' } },
            { subjectName: { contains: input.search, mode: 'insensitive' } }
          ];
        }
      }
      const orderBy =
        input?.sort && input.sort.length > 0
          ? input.sort.map((item) => ({
              [item.id]: item.desc ? 'desc' : 'asc'
            }))
          : [{ id: 'desc' }];

      const page = input?.page ?? 1;
      const limit = input?.perPage ?? 10;
      const offset = (page - 1) * limit;

      const [subjectList, totalCount] = await prisma.$transaction([
        prisma.subject.findMany({
          where,
          include: options?.includeDetails ? subjectWithDetails : undefined,
          orderBy,
          ...(paginate ? { skip: offset, take: limit } : {})
        }),
        prisma.subject.count({ where })
      ]);
      const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

      return {
        subjects: subjectList as T extends true
          ? SubjectWithDetails[]
          : Subject[],
        pageCount
      };
    } catch (error) {
      console.error('Error fetching classes:', error);
      return {
        subjects: [] as unknown as T extends true
          ? SubjectWithDetails[]
          : Subject[],
        pageCount: 0
      };
    }
  };
  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [JSON.stringify(input ?? {}) + JSON.stringify(options ?? {})],
      {
        tags: ['subjects'],
        revalidate: 3600
      }
    )();
  }
  return await queryFunction();
}
