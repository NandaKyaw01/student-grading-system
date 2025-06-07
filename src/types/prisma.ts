import { Prisma } from '@/generated/prisma';

// types/prisma.ts

export type StudentWithRelations = Prisma.StudentGetPayload<{
  include: {
    enrollments: {
      include: {
        class: true;
        semester: true;
      };
    };
    grades: {
      include: {
        subject: true;
        semester: true;
      };
    };
    results: {
      include: {
        semester: true;
      };
    };
  };
}>;
