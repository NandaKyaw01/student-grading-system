import { Prisma } from '@/generated/prisma';

export type Student = Prisma.StudentGetPayload<{
  include: {
    class: true;
    academicYear: true;
  };
}>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type AcademicYear = Prisma.AcademicYearGetPayload<{}>;

export type Class = Prisma.ClassGetPayload<{
  include: {
    academicYear: true;
  };
}>;
