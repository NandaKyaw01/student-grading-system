// app/api/academic-year-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust path as needed
import { Prisma, Status } from '@/generated/prisma';

// Types (you may want to import these from your existing types file)
interface GetAcademicResultSchema {
  search?: string;
  academicYear?: string | string[];
  class?: string | string[];
  status?: string | string[];
  page?: number;
  perPage?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const input: GetAcademicResultSchema = {
      search: searchParams.get('search') || undefined,
      academicYear: searchParams.get('academicYear')?.split(',') || undefined,
      class: searchParams.get('class')?.split(',') || undefined,
      status: searchParams.get('status')?.split(',') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      perPage: searchParams.get('perPage')
        ? parseInt(searchParams.get('perPage')!)
        : 10
    };

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
                  admissionId: {
                    contains: input.search,
                    mode: 'insensitive'
                  }
                }
              },
              {
                student: {
                  studentName: {
                    contains: input.search,
                    mode: 'insensitive'
                  }
                }
              }
            ];
          }

          // Filter by academic year range (e.g., "2024-2025")
          if (input?.academicYear && input?.academicYear?.length > 0) {
            const academicYears = Array.isArray(input.academicYear)
              ? input.academicYear
              : [input.academicYear];

            where.academicYear = {
              yearRange: {
                in: academicYears
              }
            };
          }

          // Filter by class name (e.g., "First Year")
          if (input?.class && input?.class?.length > 0) {
            const classes = Array.isArray(input.class)
              ? input.class
              : [input.class];

            where.student = {
              enrollments: {
                some: {
                  class: {
                    className: {
                      in: classes
                    }
                  },
                  // Ensure the enrollment is in the same academic year
                  semester: {
                    academicYear: {
                      yearRange: {
                        in: Array.isArray(input.academicYear)
                          ? input.academicYear
                          : input.academicYear
                            ? [input.academicYear]
                            : []
                      }
                    }
                  }
                }
              }
            };
          }

          // Filter by status
          if (input?.status && input?.status?.length > 0) {
            const statuses = Array.isArray(input.status)
              ? input.status
              : [input.status];

            where.status = {
              in: statuses as Status[]
            };
          }
        }

        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const [results, totalCount] = await prisma.$transaction([
          prisma.academicYearResult.findMany({
            where,
            include: {
              student: true
            },
            orderBy: [{ createdAt: 'desc' }],
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.academicYearResult.count({ where })
        ]);

        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

        return {
          results,
          pageCount,
          totalCount
        };
      } catch (error) {
        console.error('❌ Error fetching academic year results:', error);
        throw error;
      }
    };

    const data = await queryFunction();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
