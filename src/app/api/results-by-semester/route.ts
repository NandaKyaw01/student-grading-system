// app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Adjust path as needed
import { Prisma, Status } from '@/generated/prisma';

// Types (you may want to import these from your existing types file)
interface GetResultSchema {
  search?: string;
  academicYear?: string | string[];
  semester?: string | string[];
  status?: string | string[];
  class?: string | string[];
  page?: number;
  perPage?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const input: GetResultSchema = {
      search: searchParams.get('search') || undefined,
      academicYear: searchParams.get('academicYear')?.split(',') || undefined,
      semester: searchParams.get('semester')?.split(',') || undefined,
      status: searchParams.get('status')?.split(',') || undefined,
      class: searchParams.get('class')?.split(',') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      perPage: searchParams.get('perPage')
        ? parseInt(searchParams.get('perPage')!)
        : 10
    };

    const queryFunction = async () => {
      try {
        const where: Prisma.ResultWhereInput = {};
        const enrollmentFilter: Prisma.EnrollmentWhereInput = {};
        let paginate = true;

        if (!input || Object.keys(input).length === 0) {
          paginate = false;
        } else {
          // Search
          if (input.search?.trim()) {
            where.OR = [
              {
                enrollment: {
                  student: {
                    admissionId: {
                      contains: input.search,
                      mode: 'insensitive'
                    }
                  }
                }
              },
              {
                enrollment: {
                  student: {
                    studentName: {
                      contains: input.search,
                      mode: 'insensitive'
                    }
                  }
                }
              },
              {
                enrollment: {
                  rollNumber: {
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

            enrollmentFilter.semester = {
              academicYear: {
                yearRange: {
                  in: academicYears
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

          // Filter by semester name (e.g., "First Semester")
          if (input?.semester && input?.semester?.length > 0) {
            const semesters = Array.isArray(input.semester)
              ? input.semester
              : [input.semester];

            enrollmentFilter.semester = {
              semesterName: {
                in: semesters
              }
            };
          }

          // Filter by class name (e.g., "First Year")
          if (input?.class && input?.class?.length > 0) {
            const classes = Array.isArray(input.class)
              ? input.class
              : [input.class];

            enrollmentFilter.class = {
              className: {
                in: classes
              }
            };
          }
        }

        if (Object.keys(enrollmentFilter).length > 0) {
          where.enrollment = enrollmentFilter;
        }

        const page = input?.page ?? 1;
        const limit = input?.perPage ?? 10;
        const offset = (page - 1) * limit;

        const [results, totalCount] = await prisma.$transaction([
          prisma.result.findMany({
            where,
            include: {
              enrollment: {
                select: {
                  class: {
                    select: {
                      className: true,
                      departmentCode: true
                    }
                  },
                  semester: {
                    select: {
                      semesterName: true,
                      academicYear: {
                        select: {
                          yearRange: true,
                          isCurrent: true
                        }
                      }
                    }
                  },
                  student: {
                    select: {
                      studentName: true,
                      admissionId: true
                    }
                  }
                }
              }
            },
            orderBy: [{ createdAt: 'desc' }],
            ...(paginate ? { skip: offset, take: limit } : {})
          }),
          prisma.result.count({ where })
        ]);

        const pageCount = paginate ? Math.ceil(totalCount / limit) : 1;

        return {
          results,
          pageCount,
          totalCount
        };
      } catch (error) {
        console.error('❌ Error fetching results:', error);
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
