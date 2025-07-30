'use server';

import { AcademicYearResult, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/db';
import { getErrorMessage } from '@/lib/handle-error';
import { GetAcademicResultSchema } from '@/lib/search-params/academic-result';
import { revalidateTag, unstable_cache } from 'next/cache';

const academicYearResultWithDetails =
  Prisma.validator<Prisma.AcademicYearResultInclude>()({
    student: true,
    academicYear: true
  });

export type AcademicYearResultWithDetails =
  Prisma.AcademicYearResultGetPayload<{
    include: typeof academicYearResultWithDetails;
  }>;

export async function getAllAcademicYearResults<T extends boolean = false>(
  input?: GetAcademicResultSchema,
  options?: {
    includeDetails?: T;
    useCache?: boolean;
  }
): Promise<{
  results: T extends true
    ? AcademicYearResultWithDetails[]
    : AcademicYearResult[];
  pageCount: number;
}> {
  const queryFunction = async () => {
    try {
      const where: Prisma.AcademicYearResultWhereInput = {};
      let paginate = true;

      if (!input || Object.keys(input).length === 0) {
        paginate = false;
      } else {
        // Search by student name
        if (input.search?.trim()) {
          where.OR = [
            {
              student: {
                studentName: {
                  contains: input.search,
                  mode: 'insensitive'
                }
              }
            },
            {
              student: {
                admissionId: {
                  contains: input.search,
                  mode: 'insensitive'
                }
              }
            }
          ];
        }

        // Filter by academic year
        if (input?.academicYearId && input?.academicYearId?.length > 0) {
          where.academicYearId = {
            in: input.academicYearId
          };
        }

        if (input?.classId && input?.classId?.length > 0) {
          where.student = {
            enrollments: {
              some: {
                classId: {
                  in: input.classId
                },
                // Optional: You might also want to ensure the enrollment is in the same academic year
                semester: {
                  academicYearId: {
                    in: input.academicYearId || [] // Use the same academic year filter
                  }
                }
              }
            }
          };
        }

        if (input?.status && input?.status?.length > 0) {
          where.status = {
            in: input.status
          };
        }

        // Date range filter
        const range = Array.isArray(input.createdAt)
          ? input.createdAt
          : typeof input.createdAt === 'string' && input.createdAt.includes(',')
            ? input.createdAt.split(',')
            : null;

        if (range?.length === 2) {
          const [from, to] = range.map((ts) => new Date(Number(ts)));
          if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
            where.createdAt = { gte: from, lte: to };
          }
        }
      }

      // Sorting
      const orderBy =
        input?.sort && input.sort.length > 0
          ? [
              ...input.sort.map((item) => ({
                [item.id]: item.desc ? 'desc' : 'asc'
              }))
            ]
          : [
              // { overallGpa: 'desc' },
              // { yearRank: 'asc' },
              { createdAt: 'desc' }
            ];

      const page = input?.page ?? 1;
      const limit = input?.perPage ?? 10;
      const offset = (page - 1) * limit;

      const [results, totalCount] = await prisma.$transaction([
        prisma.academicYearResult.findMany({
          where,
          include: options?.includeDetails
            ? academicYearResultWithDetails
            : undefined,
          orderBy,
          ...(paginate ? { skip: offset, take: limit } : {})
        }),
        prisma.academicYearResult.count({ where })
      ]);

      const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

      return {
        results: results as T extends true
          ? AcademicYearResultWithDetails[]
          : AcademicYearResult[],
        pageCount
      };
    } catch (error) {
      console.error('❌ Error fetching academic year results:', error);
      return {
        results: [] as unknown as T extends true
          ? AcademicYearResultWithDetails[]
          : AcademicYearResult[],
        pageCount: 0
      };
    }
  };

  if (options?.useCache !== false) {
    return await unstable_cache(
      queryFunction,
      [
        `academic-year-results-${JSON.stringify(input ?? {})}-${JSON.stringify(options ?? {})}`
      ],
      {
        revalidate: 1,
        tags: ['academic-year-results']
      }
    )();
  }
  return await queryFunction();
}

export async function deleteAcademicResult(id: number) {
  try {
    await prisma.academicYearResult.delete({
      where: { id }
    });

    revalidateTag('academic-year-results');

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

export async function deleteAcademicResults(ids: number[]) {
  try {
    await prisma.academicYearResult.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    revalidateTag('academic-year-results');

    return {
      data: true,
      error: null
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err)
    };
  }
}

const academicYearResultViewWithDetails =
  Prisma.validator<Prisma.AcademicYearResultInclude>()({
    student: true,
    academicYear: {
      include: {
        semesters: true
      }
    },
    semesterResults: {
      include: {
        enrollment: {
          include: {
            grades: {
              include: {
                classSubject: {
                  include: {
                    subject: true
                  }
                }
              }
            },
            class: true,
            semester: true
          }
        }
      }
    }
  });

export type AcademicYearResultViewWithDetails =
  Prisma.AcademicYearResultGetPayload<{
    include: typeof academicYearResultViewWithDetails;
  }>;

export async function getAcademicYearResult(id: number) {
  try {
    const result = await prisma.academicYearResult.findUnique({
      where: {
        id: id
      },
      include: academicYearResultViewWithDetails
    });

    if (!result) {
      return {
        result: null
      };
    }

    const gradeScales = await prisma.gradeScale.findMany({
      orderBy: {
        minMark: 'desc'
      },
      take: 8
    });

    const gradeScalesFormat = gradeScales.map((scale) => ({
      grade: `${scale.grade} (${scale.minMark}-${scale.maxMark})`,
      score: `${scale.score.toFixed(2)} (${scale.minMark}-${scale.maxMark})`
    }));

    return {
      result,
      gradeScales: gradeScalesFormat,
      error: null
    };
  } catch (err) {
    return {
      result: null,
      error: getErrorMessage(err)
    };
  }
}
